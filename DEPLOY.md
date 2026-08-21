# GitHub এ Upload করে Live করার নিয়ম

## ১. রিপো তৈরি করুন
GitHub-এ একটা নতুন repository বানান (উদাহরণ নাম: `evlab-3d-studio`)।

## ২. vite.config.ts এর নাম মিলিয়ে নিন
`vite.config.ts` ফাইলে এই লাইনটা আছে:
```ts
base: process.env.GITHUB_PAGES === 'true' ? '/evlab-3d-studio/' : '/',
```
আপনার repo-র নাম যদি `evlab-3d-studio` না হয়ে অন্য কিছু হয়, তাহলে `/evlab-3d-studio/` অংশটা আপনার আসল repo নাম দিয়ে বদলে দিন (আগে-পিছে `/` রাখবেন)।

## ৩. কোড push করুন
```bash
cd evlab-3d-studio        # extract করা ফোল্ডারে ঢুকুন
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<আপনার-ইউজারনেম>/evlab-3d-studio.git
git push -u origin main
```

## ৪. GitHub Pages চালু করুন
- রিপোর **Settings → Pages** এ যান
- **Source** এ `GitHub Actions` সিলেক্ট করুন

এইটুকু করলেই হবে — `.github/workflows/deploy.yml` ফাইলটা ইতিমধ্যে যোগ করা আছে, যেটা প্রতিবার `main` ব্রাঞ্চে push দিলে স্বয়ংক্রিয়ভাবে বিল্ড করে Pages-এ deploy করে দেবে।

## ৫. লাইভ লিংক
কয়েক মিনিট পর আপনার সাইট লাইভ হবে এখানে:
```
https://<আপনার-ইউজারনেম>.github.io/evlab-3d-studio/
```

## নোট
- `npm install` লোকালি টেস্ট করতে চাইলে করুন, তবে push করলে GitHub নিজেই Actions-এ ইন্সটল ও বিল্ড করবে — আলাদা করে `dist/` ফোল্ডার আপনাকে বানিয়ে push করতে হবে না।
- `GEMINI_API_KEY` কোডে কোথাও ব্যবহার হয়নি, তাই সেটা ছাড়াই বিল্ড/ডিপ্লয় হবে — কোনো Secret সেট করা লাগবে না।
- প্রথমবার Actions ওয়ার্কফ্লো রান হতে ২-৩ মিনিট লাগতে পারে — Actions ট্যাবে progress দেখতে পাবেন।
