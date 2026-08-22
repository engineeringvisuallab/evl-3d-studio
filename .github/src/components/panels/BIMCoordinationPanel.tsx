/**
 * EVLab 3D Studio - OpenBIM BCF Coordination & Issue Management Panel
 * Manages BCF 2.1/3.0 Issues, Clash-to-Issue conversion, discipline assignment, viewpoints, and comments.
 */

import React, { useState } from 'react';
import { useBIMStore } from '../../bim/BIMCoreStore';
import { BCFIssue, BCFIssueStatus, BCFIssuePriority } from '../../bim/core/BIMTypes';
import { GitPullRequest, AlertCircle, CheckCircle2, MessageSquare, Plus, Filter, ShieldAlert } from 'lucide-react';

export const BIMCoordinationPanel: React.FC = () => {
  const { coordinationEngine, createBCFIssue, updateBCFIssueStatus, addBCFComment, elements } = useBIMStore();
  const issues = coordinationEngine.getAllIssues();

  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id || '');
  const [newComment, setNewComment] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPriority, setNewPriority] = useState<BCFIssuePriority>('High');

  const selectedIssue = coordinationEngine.getIssue(selectedIssueId) || issues[0];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedIssue) return;
    addBCFComment(selectedIssue.id, 'Lead BIM Coordinator', newComment.trim());
    setNewComment('');
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const issue = createBCFIssue(newTitle, newDesc, [], undefined, newPriority);
    setSelectedIssueId(issue.id);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-xs select-none">
      {/* Top Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
            <GitPullRequest className="w-4 h-4" />
            <span>OpenBIM BCF Coordination</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            BCF 2.1/3.0 Multi-Disciplinary Issue & Clash Tracker
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold transition"
        >
          <Plus className="w-3 h-3" />
          <span>New Issue</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Issues List */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-1 flex justify-between">
            <span>Coordination Issues</span>
            <span className="text-cyan-400 font-mono">{issues.length} Issues</span>
          </div>

          {issues.map((iss) => {
            const isSelected = iss.id === selectedIssue?.id;
            return (
              <button
                key={iss.id}
                onClick={() => setSelectedIssueId(iss.id)}
                className={`w-full text-left p-2 rounded transition border text-[11px] space-y-1 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-cyan-400 font-bold border border-slate-700">
                    {iss.id}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      iss.priority === 'Critical'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : iss.priority === 'High'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {iss.priority}
                  </span>
                </div>
                <div className="truncate font-semibold text-slate-200">{iss.title}</div>
                <div className="flex justify-between text-[10px] text-slate-400 font-normal">
                  <span>Assigned: {iss.assignedTo}</span>
                  <span
                    className={`font-semibold ${
                      iss.status === 'Resolved' || iss.status === 'Closed' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {iss.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Issue Inspector */}
        {selectedIssue && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3">
            <div className="space-y-1 border-b border-slate-800 pb-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-cyan-400 font-bold text-xs">{selectedIssue.id}</span>
                <select
                  value={selectedIssue.status}
                  onChange={(e) => updateBCFIssueStatus(selectedIssue.id, e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 text-[10px] font-semibold"
                >
                  <option value="Open">Status: Open</option>
                  <option value="In Progress">Status: In Progress</option>
                  <option value="Resolved">Status: Resolved</option>
                  <option value="Closed">Status: Closed</option>
                </select>
              </div>
              <h4 className="font-bold text-slate-200 text-xs">{selectedIssue.title}</h4>
              <p className="text-slate-400 text-[11px]">{selectedIssue.description}</p>
            </div>

            {/* Elements & Discipline */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Discipline:</span>
                <span className="font-medium text-cyan-300">{selectedIssue.discipline}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Author:</span>
                <span className="text-slate-200">{selectedIssue.author}</span>
              </div>
              {selectedIssue.clashRefId && (
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Clash Reference:</span>
                  <span className="font-mono text-rose-400">{selectedIssue.clashRefId}</span>
                </div>
              )}
            </div>

            {/* Comments Thread */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-mono text-cyan-400 font-bold flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>Comments & Coordination Log</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {selectedIssue.comments.map((c) => (
                  <div key={c.id} className="p-2 bg-slate-900 border border-slate-800 rounded text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-400 font-mono">
                      <span className="text-cyan-300 font-bold">{c.author}</span>
                      <span>{new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-200">{c.comment}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-1 pt-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add coordination note..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-[11px] placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
