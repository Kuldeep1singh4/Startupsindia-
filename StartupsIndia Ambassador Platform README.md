# **StartupsIndia Ambassador Platform**
## **Dashboard, User Flow & Functional Requirements — V1**

### **1. Project Objective**
Build a simple and scalable **StartupsIndia Ambassador Platform** where students can:
1.  Register as a StartupsIndia Ambassador
2.  Get approved by the admin team
3.  Access their personal dashboard
4.  View assigned tasks
5.  Complete tasks and submit proof
6.  Earn points
7.  Progress through Ambassador levels
8.  Unlock rewards and benefits
9.  View their leaderboard ranking. 
10. Represent StartupsIndia at their college/city/district/state/national level

The platform should be **simple, mobile-friendly, easy to understand and gamified without becoming complicated**.

---

# **2. Main User Journey**
### **Overall Flow**
```text
Landing Page
     ↓
Become an Ambassador
     ↓
Registration
     ↓
Application Submitted
     ↓
Admin Verification
     ↓
Application Approved
     ↓
Ambassador Account Created
     ↓
Login
     ↓
Personal Dashboard
     ↓
View Tasks
     ↓
Complete Task
     ↓
Submit Proof
     ↓
Admin Verification
     ↓
Points Added
     ↓
Progress Updated
     ↓
Level Achieved
     ↓
Reward Unlocked
     ↓
Leaderboard Updated
```

---

# **3. User Types**
### **A. Ambassador**
The student/user who participates in the program.

### **B. Admin**
StartupsIndia team member who manages:
  - Ambassador applications
  - Tasks
  - Points
  - Proof submissions
  - Levels
  - Rewards
  - Leaderboard
  - Ambassador accounts

---

# **4. Ambassador Registration Flow**
## **Page 1 — Ambassador Landing Page**
Main CTA:
**Become a StartupsIndia Ambassador**

Content:
  - What is the program?
  - Why become an ambassador?
  - How it works
  - Levels
  - Benefits
  - Rewards
  - FAQs
  - Register button

CTA:
**Join the Ambassador Program**

---

# **5. Registration Form**
### **Personal Details**
  - Full Name
  - Email
  - Mobile Number
  - Profile Photo

### **College Details**
  - College Name
  - Course
  - Branch
  - Current Year
  - City
  - District
  - State

### **Social Details**
  - LinkedIn URL
  - Instagram URL
  - YouTube URL — optional

### **Additional Information**
  - Why do you want to become an Ambassador?
  - Areas of interest

### **Agreement**
Checkbox:
"I agree to the StartupsIndia Ambassador Program terms and conditions."

CTA:
**Submit Application**

---

# **6. Application Status**
After registration, show:

### **Application Submitted**
Thank you for applying to become a StartupsIndia Ambassador.

Status:
**Under Review**

Possible statuses:
  - Pending
  - Approved
  - Rejected

Once approved, send:
  - Email
  - WhatsApp notification, if configured
  - Login/access information

---

# **7. Ambassador Login**
Login options:
  - Email + Password
  - Mobile + OTP

After successful login:
**Redirect → Ambassador Dashboard**

---

# **8. Ambassador Dashboard**
The dashboard should be the main screen.

## **Header**
Show:
**Welcome, [Name] 👋**
Subtitle:
Complete tasks, earn points and unlock new opportunities.

---

# **9. Dashboard Cards**
Keep the dashboard simple.

### **Card 1 — Current Level**
Example:
**🥈 Silver Ambassador**
Campus Ambassador

---
### **Card 2 — Points**
**1,250 Points**
Show progress toward next level.
Example:
**1,250 / 2,000**

---
### **Card 3 — Leaderboard Rank**
**#24**
India Ranking

---
### **Card 4 — Tasks Completed**
**12 Tasks**

---
### **Card 5 — Students Referred**
**48 Students**

---

# **10. Ambassador Journey**
Show a simple horizontal progression:
```text
Bronze
  ↓
Silver
  ↓
Gold
  ↓
Platinum
  ↓
Diamond
  ↓
National
```
Each level should display:
  - Level name
  - Designation
  - Requirement
  - Unlock status

Locked levels should have a lock icon.

---

# **11. Ambassador Levels**
The exact points/requirements will be finalized after the task structure is finalized.

### **Level 1 — Bronze**
Designation:
**Campus Ambassador**

---
### **Level 2 — Silver**
Designation:
**Campus Ambassador / Senior Campus Ambassador**

---
### **Level 3 — Gold**
Designation:
**City Ambassador**

---
### **Level 4 — Platinum**
Designation:
**District Ambassador**

---
### **Level 5 — Diamond**
Designation:
**State Ambassador**

---
### **Level 6 — National**
Designation:
**National Ambassador**
National Ambassador can be a special selection/achievement rather than an automatic points level.

---

# **12. Tasks Page**
Navigation:
**My Tasks**

This page shows all assigned tasks.
Each task should contain:
  - Task name
  - Description
  - Deadline, if applicable
  - Points
  - Status
  - Submit button

Example:
### **Task**
**Share StartupsIndia Campaign**
Description:
Share the official campaign on Instagram and submit the post link.
**Reward: +100 Points**
Button:
**Submit Proof**

---

# **13. Task Status**
Each task can have one of these statuses:

### **Not Started**
Start Task
### **In Progress**
Continue
### **Submitted**
Under Review
### **Approved**
Completed ✓
### **Rejected**
Resubmit

---

# **14. Task Submission Flow**
```text
View Task
    ↓
Read Instructions
    ↓
Complete Task
    ↓
Submit Proof
    ↓
Admin Review
    ↓
Approved?
   ↙     ↘
 YES      NO
 ↓         ↓
Points     Resubmit
Added
```

Proof types can include:
  - Image
  - Screenshot
  - URL
  - Text
  - Video URL
  - Event details

The task configuration should determine which proof type is required.

---

# **15. Points System**
Use a simple **Points** system.
No need to expose complicated XP terminology to ambassadors in V1.

Example:
```text
Task Completed
       ↓
Admin Approval
       ↓
Points Added
       ↓
Total Points Updated
       ↓
Level Progress Updated
       ↓
Leaderboard Updated
```

Example:
**Current Points: 1,250**
After completing a 200-point task:
**New Points: 1,450**

---

# **16. Leaderboard**
Main navigation:
**Leaderboard**

Leaderboard should show:
### **All India**
Rank | Ambassador | College | Level | Points

Example:
1.  Rahul — ABC College — Gold — 4,500
2.  Priya — XYZ College — Gold — 4,250
3.  Arjun — ABC University — Silver — 3,900

---

# **17. Leaderboard Filters**
Keep the filters simple:

### **Location**
  - India
  - State
  - District
  - City

### **Competition Period**
  - Monthly
  - Quarterly
  - All Time

### **College**
Allow ambassador to view their college ranking.

---

# **18. College Leaderboard**
A separate leaderboard can show:
**Top Colleges**

Example:
1.  ABC University — 45,000 points
2.  XYZ College — 38,500 points
3.  DEF Institute — 31,200 points

College points are calculated from the verified points earned by ambassadors belonging to that college.

---

# **19. Rewards Page**
Navigation:
**Rewards**

Divide rewards into:

### **Unlocked**
Rewards the ambassador has already earned.

### **Locked**
Rewards that require a higher level/points.

Example:
**🎁 StartupsIndia Welcome Kit**
Status:
**Unlocked**

---
**👕 StartupsIndia Goodies**
Status:
**Locked**
Unlock at Silver

---
**🎟 Event Benefits**
Status:
**Locked**
Unlock at Gold

---

# **20. Planned Benefits & Rewards**
Potential StartupsIndia benefits:
1.  Welcome Kit
2.  StartupsIndia Goodies
3.  Special Vouchers
4.  Startup/Business Event Discounts
5.  Free Event Entries
6.  Creator Dashboard Access
7.  Scholarship Opportunities
8.  Internship Opportunities
9.  Startup Ecosystem Access
10. Founder/Investor Networking
11. Electronic Gadgets
12. Smartphone
13. Tablet
14. Laptop
15. Royal Enfield Bullet — Grand Prize
16. Sponsored International Trip — Grand Prize

Rewards should be configurable from the admin panel rather than hard-coded.

---

# **21. Reward Unlock Flow**
```text
Ambassador earns points
        ↓
Required level reached
        ↓
Reward becomes unlocked
        ↓
Reward appears in Rewards page
        ↓
Ambassador claims reward
        ↓
Admin processes reward
        ↓
Status = Delivered
```

Reward statuses:
  - Locked
  - Unlocked
  - Claim Requested
  - Approved
  - Processing
  - Delivered

---

# **22. My Profile**
Profile should show:

### **Personal**
  - Profile Photo
  - Name
  - Email
  - Mobile

### **Ambassador**
  - Ambassador ID
  - Current Level
  - Designation
  - Total Points
  - Rank

### **College**
  - College
  - Course
  - Branch
  - Year
  - City
  - District
  - State

### **Referral**
  - Referral Code
  - Referral Link

CTA:
**Edit Profile**

---

# **23. Ambassador ID**
Every approved ambassador should receive a unique ID.
Example:
**SI-AMB-2026-00125**
This ID should be unique.

---

# **24. Referral Code**
Each ambassador gets a unique referral code.
Example:
**RAHUL123**

Referral link flow:
```text
StartupsIndia website
        ↓
Referral Code
        ↓
New User Registration
        ↓
Ambassador Attribution
        ↓
Verification
        ↓
Points
```
Only verified/eligible referrals should generate points.

---

# **25. Certificates**
Navigation:
**Certificates**

Show certificates earned by the ambassador.
Examples:
  - Ambassador Participation Certificate
  - Campus Ambassador Certificate
  - Gold Ambassador Certificate
  - State Ambassador Certificate
  - National Ambassador Certificate

Certificate should be downloadable as PDF.

---

# **26. Notifications**
Dashboard should have a notification icon.
Notifications can include:
  - New task assigned
  - Task approved
  - Task rejected
  - Points added
  - Level unlocked
  - Reward unlocked
  - Event announcement
  - Leaderboard update
  - Important StartupsIndia announcements

---

# **27. Admin Panel**
The admin panel is required to manage the complete system.

## **Admin Dashboard**
Show:
  - Total Ambassadors
  - Active Ambassadors
  - Pending Applications
  - Tasks Completed
  - Pending Task Reviews
  - Total Points
  - Rewards Claimed
  - Top Ambassadors
  - Top Colleges

---

# **28. Ambassador Management**
Admin can:
  - View ambassadors
  - Search ambassadors
  - Filter by college
  - Filter by city
  - Filter by district
  - Filter by state
  - View profile
  - Approve application
  - Reject application
  - Suspend account
  - Edit ambassador details

---

# **29. Task Management**
Admin can create a task.

### **Task Fields**
  - Task Name
  - Description
  - Instructions
  - Points
  - Start Date
  - End Date
  - Level
  - Target Audience
  - Proof Type
  - Maximum submissions
  - Status

Admin can:
**Create → Edit → Publish → Pause → Close**

---

# **30. Task Verification**
Admin sees:

### **Pending Submissions**
For every submission:
  - Ambassador
  - Task
  - Submitted date
  - Proof
  - Current level

Actions:
**Approve**
or
**Reject**

If approved:
Task → Completed
Points → Added
Leaderboard → Updated
Progress → Updated

---

# **31. Level Management**
Admin should be able to configure:
  - Level name
  - Minimum points
  - Maximum points
  - Designation
  - Benefits
  - Rewards
  - Badge
  - Certificate

Example:
Level: Gold
Minimum Points: XXXX
Designation: City Ambassador
Benefits: XXXX
Rewards: XXXX

The actual thresholds will be finalized after the task list is created.

---

# **32. Reward Management**
Admin can create rewards.
Fields:
  - Reward name
  - Description
  - Image
  - Required level
  - Required points
  - Quantity
  - Availability
  - Claim deadline
  - Terms
  - Delivery status

---

# **33. Leaderboard Logic**
Leaderboard should calculate rankings automatically.

### **Ranking basis:**
**Verified Points only**
Do not include:
  - Pending points
  - Rejected submissions
  - Unverified referrals

Example:
Ambassador A
Verified Points = 4,500
Ambassador B
Verified Points = 4,250
Ambassador C
Verified Points = 3,900

Leaderboard:
**A → #1**
**B → #2**
**C → #3**

---

# **34. Important Anti-Fraud Rules**
The system should prevent easy manipulation.

### **Referral fraud**
Do not award points immediately.
```text
Referral
↓
Registration
↓
Verification
↓
Eligible
↓
Points
```

### **Task fraud**
Require proof for applicable tasks.

### **Duplicate submissions**
One task submission should not generate points multiple times unless the task is explicitly repeatable.

### **Admin override**
Admin should be able to adjust points with a reason recorded in the system.

---

# **35. Mobile Responsive Design**
The dashboard must work properly on:
  - Desktop
  - Laptop
  - Tablet
  - Mobile

Mobile navigation can become:
Dashboard
Tasks
Leaderboard
Rewards
Profile

---

# **36. Recommended V1 Navigation**
Keep the navigation very simple:

### **Sidebar**
🏠 Dashboard
🎯 My Tasks
🏆 Leaderboard
🎁 Rewards
👤 My Profile
📜 Certificates
🔔 Notifications

---

# **37. Final V1 User Flow**
```text
                   USER
                     │
                     ▼
          Ambassador Landing Page
                     │
                     ▼
                Registration
                     │
                     ▼
             Application Review
                     │
              ┌──────┴──────┐
              ▼             ▼
           Approved       Rejected
              │
              ▼
             Login
              │
              ▼
          AMBASSADOR DASHBOARD
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
   Tasks    Level    Leaderboard
     │        │        │
     ▼        │        │
 Complete     │        │
 Task         │        │
     │        │        │
     ▼        │        │
Submit Proof  │        │
     │        │        │
     ▼        │        │
Admin Review  │        │
     │        │        │
     ▼        ▼        ▼
  Approved → Points → Ranking
              │
              ▼
        Level Progress
              │
              ▼
        Level Unlocked
              │
              ▼
        Reward Unlocked
              │
              ▼
       Reward Claim
              │
              ▼
        Ambassador Growth
```

# **38. Development Priority**
## **Phase 1 — Core**
Build first:
1.  Registration
2.  Login
3.  Ambassador profile
4.  Dashboard
5.  Task system
6.  Proof submission
7.  Admin verification
8.  Points
9.  Levels
10. Leaderboard
11. Rewards

## **Phase 2**
Add:
12. Certificates
13. Notifications
14. Referral system
15. College leaderboard
16. State/city rankings

## **Phase 3**
Add later:
17. Creator Dashboard
18. Scholarships
19. Internship system
20. Advanced analytics
21. Annual Ambassador Awards
22. Premium/gadget rewards
23. International opportunities

---

# **39. Core Principle**
The V1 platform should follow one simple rule:
### **TASK → PROOF → APPROVAL → POINTS → LEVEL → REWARD → LEADERBOARD**

The ambassador should never feel confused about what to do next.
When they open the dashboard, they should immediately see:
**Your Level  
Your Points  
Your Tasks  
Your Rank  
Your Next Reward**

This is the core StartupsIndia Ambassador experience.