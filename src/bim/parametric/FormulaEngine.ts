/**
 * EVLab BIM Core v1.4 - Formula Engine
 * Parses and evaluates parametric formulas (BIMFormula) driving Type/Instance
 * parameter values, resolves inter-parameter dependencies, detects circular
 * references, and recomputes derived parameters across a BIMElement graph.
 */

import { BIMElement, BIMFormula } from '../core/BIMTypes';

export interface FormulaEvalResult {
  formulaId: string;
  targetParameterId: string;
  value: number;
  error?: string;
}

export interface FormulaRecomputeReport {
  elementId: string;
  results: FormulaEvalResult[];
  circularReferences: string[]; // formula ids involved in a cycle
  hasErrors: boolean;
}

/* ---------------------------------------------------------------------- */
/* Tokenizer                                                                */
/* ---------------------------------------------------------------------- */

type TokenType = 'number' | 'identifier' | 'operator' | 'lparen' | 'rparen' | 'comma' | 'eof';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = expr.length;

  while (i < n) {
    const c = expr[i];

    if (/\s/.test(c)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(c)) {
      const start = i;
      while (i < n && /[0-9.]/.test(expr[i])) i++;
      tokens.push({ type: 'number', value: expr.slice(start, i) });
      continue;
    }

    if (/[a-zA-Z_]/.test(c)) {
      const start = i;
      while (i < n && /[a-zA-Z0-9_.]/.test(expr[i])) i++;
      tokens.push({ type: 'identifier', value: expr.slice(start, i) });
      continue;
    }

    if ('+-*/^'.includes(c)) {
      tokens.push({ type: 'operator', value: c });
      i++;
      continue;
    }

    if (c === '(') {
      tokens.push({ type: 'lparen', value: c });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ type: 'rparen', value: c });
      i++;
      continue;
    }
    if (c === ',') {
      tokens.push({ type: 'comma', value: c });
      i++;
      continue;
    }

    throw new Error(`Unexpected character '${c}' in formula: ${expr}`);
  }

  tokens.push({ type: 'eof', value: '' });
  return tokens;
}

/* ---------------------------------------------------------------------- */
/* Recursive-descent parser + evaluator                                     */
/*   expr    := term (('+' | '-') term)*                                    */
/*   term    := unary (('*' | '/') unary)*                                  */
/*   unary   := ('-' | '+') unary | power                                   */
/*   power   := primary ('^' unary)?                                        */
/*   primary := number | identifier | identifier '(' args ')' | '(' expr ')'*/
/* ---------------------------------------------------------------------- */

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  min: (...a) => Math.min(...a),
  max: (...a) => Math.max(...a),
  abs: (a) => Math.abs(a),
  round: (a, d = 0) => {
    const f = Math.pow(10, d);
    return Math.round(a * f) / f;
  },
  floor: (a) => Math.floor(a),
  ceil: (a) => Math.ceil(a),
  sqrt: (a) => Math.sqrt(a),
  pow: (a, b) => Math.pow(a, b),
};

class FormulaParser {
  private tokens: Token[];
  private pos = 0;

  constructor(private expr: string, private variables: Record<string, number>) {
    this.tokens = tokenize(expr);
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private next(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType): Token {
    const t = this.next();
    if (t.type !== type) {
      throw new Error(`Expected ${type} but got '${t.value}' in formula: ${this.expr}`);
    }
    return t;
  }

  parse(): number {
    const value = this.parseExpr();
    this.expect('eof');
    return value;
  }

  private parseExpr(): number {
    let value = this.parseTerm();
    while (this.peek().type === 'operator' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.next().value;
      const rhs = this.parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseUnary();
    while (this.peek().type === 'operator' && (this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.next().value;
      const rhs = this.parseUnary();
      if (op === '/') {
        if (rhs === 0) throw new Error(`Division by zero in formula: ${this.expr}`);
        value = value / rhs;
      } else {
        value = value * rhs;
      }
    }
    return value;
  }

  private parseUnary(): number {
    if (this.peek().type === 'operator' && this.peek().value === '-') {
      this.next();
      return -this.parseUnary();
    }
    if (this.peek().type === 'operator' && this.peek().value === '+') {
      this.next();
      return this.parseUnary();
    }
    return this.parsePower();
  }

  private parsePower(): number {
    const base = this.parsePrimary();
    if (this.peek().type === 'operator' && this.peek().value === '^') {
      this.next();
      const exp = this.parseUnary();
      return Math.pow(base, exp);
    }
    return base;
  }

  private parsePrimary(): number {
    const t = this.peek();

    if (t.type === 'number') {
      this.next();
      return parseFloat(t.value);
    }

    if (t.type === 'lparen') {
      this.next();
      const value = this.parseExpr();
      this.expect('rparen');
      return value;
    }

    if (t.type === 'identifier') {
      this.next();
      if (this.peek().type === 'lparen') {
        this.next();
        const args: number[] = [];
        if (this.peek().type !== 'rparen') {
          args.push(this.parseExpr());
          while (this.peek().type === 'comma') {
            this.next();
            args.push(this.parseExpr());
          }
        }
        this.expect('rparen');
        const fn = FUNCTIONS[t.value.toLowerCase()];
        if (!fn) throw new Error(`Unknown function '${t.value}' in formula: ${this.expr}`);
        return fn(...args);
      }
      const v = this.variables[t.value];
      if (v === undefined) {
        throw new Error(`Unknown variable '${t.value}' in formula: ${this.expr}`);
      }
      return v;
    }

    throw new Error(`Unexpected token '${t.value}' in formula: ${this.expr}`);
  }
}

/* ---------------------------------------------------------------------- */
/* Public Engine                                                            */
/* ---------------------------------------------------------------------- */

export class FormulaEngine {
  /**
   * Evaluates a single formula expression against a flat variable map
   * (e.g. { width: 900, height: 2100, thickness: 40 }). No eval()/Function()
   * is used - expressions run through the parser above only.
   */
  public static evaluateExpression(expr: string, variables: Record<string, number>): number {
    const parser = new FormulaParser(expr, variables);
    return parser.parse();
  }

  /** Turns a parameter's display name into a formula-safe identifier. */
  public static slug(name: string): string {
    return name.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  /**
   * Builds a numeric variable map from an element's instance parameters so
   * formulas can reference them either by parameter id or by a slugified
   * version of the parameter's display name.
   */
  private static buildVariableMap(element: BIMElement): Record<string, number> {
    const vars: Record<string, number> = {};
    Object.values(element.instanceParameters || {}).forEach((p) => {
      if (typeof p.value === 'number') {
        vars[p.id] = p.value;
        vars[FormulaEngine.slug(p.name)] = p.value;
      } else if (typeof p.value === 'boolean') {
        vars[p.id] = p.value ? 1 : 0;
      }
    });
    return vars;
  }

  /**
   * Orders formulas so a formula referencing another formula's target
   * parameter runs after that target has been computed. Detects circular
   * references instead of looping forever, and reports the ids involved.
   */
  private static topologicalOrder(formulas: BIMFormula[]): { order: BIMFormula[]; cycles: string[] } {
    const byTarget = new Map<string, BIMFormula>();
    formulas.forEach((f) => byTarget.set(f.targetParameterId, f));

    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: BIMFormula[] = [];
    const cycles: string[] = [];

    function visit(formula: BIMFormula) {
      if (visited.has(formula.id)) return;
      if (visiting.has(formula.id)) {
        cycles.push(formula.id);
        return;
      }
      visiting.add(formula.id);

      for (const inputId of formula.inputVariables) {
        const dep = byTarget.get(inputId);
        if (dep) visit(dep);
      }

      visiting.delete(formula.id);
      visited.add(formula.id);
      order.push(formula);
    }

    formulas.forEach(visit);
    return { order, cycles };
  }

  /**
   * Recomputes every formula-driven parameter on an element, in dependency
   * order, writing results back into element.instanceParameters and
   * element.calculationTrace. Returns a report the UI/Store can surface as
   * validation warnings (e.g. red badge on a circular-reference parameter).
   */
  public static recompute(element: BIMElement): FormulaRecomputeReport {
    const formulas = element.formulas || [];
    const results: FormulaEvalResult[] = [];

    if (formulas.length === 0) {
      return { elementId: element.id, results, circularReferences: [], hasErrors: false };
    }

    const { order, cycles } = FormulaEngine.topologicalOrder(formulas);
    let hasErrors = cycles.length > 0;

    for (const formula of order) {
      const vars = FormulaEngine.buildVariableMap(element);
      try {
        const value = FormulaEngine.evaluateExpression(formula.expression, vars);
        results.push({ formulaId: formula.id, targetParameterId: formula.targetParameterId, value });

        const targetParam = element.instanceParameters[formula.targetParameterId];
        if (targetParam) {
          targetParam.value = value;
          targetParam.isComputed = true;
          targetParam.formula = formula.expression;
        } else {
          element.instanceParameters[formula.targetParameterId] = {
            id: formula.targetParameterId,
            name: formula.targetParameterId,
            value,
            unit: formula.unit,
            dataType: 'Number',
            scope: 'Instance',
            isComputed: true,
            formula: formula.expression,
          };
        }

        element.calculationTrace = {
          calcId: formula.id,
          formula: formula.expression,
          inputs: vars,
          lastComputedAt: Date.now(),
        };
      } catch (e) {
        hasErrors = true;
        results.push({
          formulaId: formula.id,
          targetParameterId: formula.targetParameterId,
          value: NaN,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return { elementId: element.id, results, circularReferences: cycles, hasErrors };
  }
}
