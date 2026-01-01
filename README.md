# Blacksheep

# Application Development Project — SavePaws

## Group Members
- **Yap Jia Xin**  
- **Chang Wei Lam**  
- **Karen Voon Xiu Wen**  
- **Tan Qing Qing**

## Project Overview
This project was developed as part of **Section 02’s Application Development coursework**.  
Our team collaborated to design and implement an application that designed to replace the current, fragmented, and inefficient manual processes for assisting stray animals called SavePaws. SavePaws integrates Animal Report & Rescue Management, Adoption, Donation & Sponsorship, and Volunteer & Community into a single and efficient platform.

## Main Screen

### Authentication & User Management
- [`LandingScreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/LandingScreen.js) - Landing page
- [`Userloginscreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/Userloginscreen.js) - User login
- [`SignupScreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/SignupScreen.js) - User registration
- [`ForgotPasswordScreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/ForgotPasswordScreen.js) - Password recovery
- [`UserHomeScreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/UserHomeScreen.js) - User dashboard
- [`AdminLoginScreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/AdminLoginScreen.js) - Admin login

### Backend Authentication
- **Controllers:**<br>• [`authController.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/controllers/authController.js)
- **Routes:**<br>• [`auth.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/routes/auth.js)
- **Models:**<br>• [`User.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/models/User.js)<br>• [`Admin.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/models/Admin.js)
- **Middleware:**<br>• [`authMiddleware.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/middleware/authMiddleware.js)

## 🧩 Karen's Contribution

## Animal Reporting and Rescue Subsystem

| **Sprint** | **Module Name** | **Frontend** | **Backend** |
|-------------|-----------------|---------------|--------------|
| **1** | **Stray Animal Reporting Module** | **Pages:**<br>• [`ReportAnimalScreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/ReportAnimalScreen.js)<br>• [`ViewReportsScreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/ViewReportsScreen.js)<br>• [`AdminDashboardScreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/AdminDashboardScreen.js)<br>• [`Adminviewreportscreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/Adminviewreportscreen.js)<br><br>**Components & Services:**<br>• [`api.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/services/api.js)<br>• [`constants.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/utils/constants.js)<br>• [`AppNavigator.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/navigation/AppNavigator.js) | **Controllers:**<br>• [`reportController.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/controllers/reportController.js)<br><br>**Routes:**<br>• [`reports.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/routes/reports.js)<br><br>**Models:**<br>• [`Report.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/models/Report.js)<br><br>**Configuration:**<br>• [`database.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/config/database.js)<br>• [`initDatabase.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/config/initDatabase.js)<br><br>**Middleware:**<br>• [`logger.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/middleware/logger.js)<br>• [`errorHandler.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/middleware/errorHandler.js) |
| **2** | **Rescue Task Module** | **Pages:**<br>• [`RescueTasksscreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/RescueTasksscreen.js)<br>• [`AcceptRescueTaskScreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/AcceptRescueTaskScreen.js)<br>• [`Myrescuetaskdetailscreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/Myrescuetaskdetailscreen.js)<br>• [`ManageRescueTasksScreen.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/screens/ManageRescueTasksScreen.js)<br><br>**Components & Services:**<br>• [`api.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/services/api.js)<br>• [`constants/index.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/constants/index.js)<br>• [`AppNavigator.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Frontend/src/navigation/AppNavigator.js) | **Routes:**<br>• [`rescueTasks.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/routes/rescueTasks.js)<br><br>**Models:**<br>• [`Report.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/models/Report.js) (used for rescue task data)<br><br>**Configuration:**<br>• [`database.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/config/database.js)<br>• [`initDatabase.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/config/initDatabase.js)<br><br>**Middleware:**<br>• [`authMiddleware.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/middleware/authMiddleware.js)<br>• [`logger.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/middleware/logger.js)<br>• [`errorHandler.js`](https://github.com/Jiaxin061/Blacksheep/blob/Karen/Backend/middleware/errorHandler.js) |
| **3** | **Rescue Update Module** | **Page:**<br>- Rescue Progress Page<br><br>**Component:**<br>- Progress Update Form<br>- Rescue Status Card<br><br>**Service:**<br>- Notification Trigger Service |**Controller:**<br>- Rescue Update Controller<br><br>**Routes:**<br>- /rescue/update<br>- /rescue/status<br><br>**Entity:**<br>- Rescue Update Model |
| **4** | **Integration & Testing** | **Page:**<br>- Integration Dashboard<br><br>**Component:**<br>- Module Testing Interface<br>- Summary Display<br><br>**Service:**<br>- System Testing Service | **Controller:**<br>- Integration Controller<br><br>**Routes:**<br>- /integration/test<br>- /integration/report<br><br>**Entity:**<br>- System Log Model |

<br><br>

## 🧩 __Wei Lam’s Contribution__ 
## Adoption Subsytem

| **Sprint** | **Module Name** | **Frontend** | **Backend** |
|-------------|-----------------|---------------|--------------|
| **1** | **Animal Record Module** | **Page:**<br>- AnimalList Page<br>-Animal Search Page<br>- Manage Record Page<br><br>**Component:**<br>- Animal Card<br>- Search Bar Filter<br> -Animal Form Modal<br><br>**Service:**<br>- Animal Data Service<br> | **Controller:**<br>- Record Animal Controller<br><br>**Routes:**<br>- /animals<br>- /animals/{id}<br> -/animals/search<br>**Entity:**<br>- Animal Record Model |
| **2** | **Adoption Process Module (Request and Approval)** | **Page:**<br>- Adoption Request Page<br>- Adoption Approval Page<br> <br>**Component:**<br>- Request Form<br>- Request Status Table<br>- Approval Dashboard<br> <br>**Service:**<br>- Adoption Request Service<br> | **Controller:**<br>- Adoption Controller<br><br>**Routes:**<br>-/adoptions/request<br> -/adoptions/pending<br> -/adoptions/approve/{id}<br> -/adoptions/reject/{id}<br><br>**Entity:**<br>- Adoption Request Model |
|**3**| **Adoption Follow-Up Module** | **Page:**<br>- Follow-Up List Page<br>- Follow-Up Form Page<br>- Follow-Up Detail Page<br><br>**Component:**<br>- Follow-Up Table<br>- Follow-Up Form<br>- Condition Status Display<br><br>**Service:**<br>- Follow-Up Management Service | **Controller:**<br>- Follow-Up Controller<br><br>**Routes**:<br>- /followups<br>- /followups/{id}<br>- /followups/create<br>- /followups/update/{id}<br><br>**Entity:**<br>- Follow-Up Model |
|**4**| **Integration & Testing** | **Page:**<br>- Adoption Integration Dashboard<br><br>**Component:**<br>- Module Testing Interface<br>- Summary Report Display<br><br>**Service:**<br>- Adoption Testing Service | **Controller:**<br>- Adoption Integration Controller<br><br>**Routes:**<br>- /adoption/integration/test<br>- /adoption/integration/report<br><br>**Entity:**<br>- Adoption Log Model |

<br><br>

## 🧩 __Tan Qing Qing’s Contribution__ 
## Volunteer and Community Subsystem

| **Sprint** | **Module Name** | **Frontend** | **Backend** |
|-------------|-----------------|---------------|--------------|
| **1** | **Volunteer Registration Module** | **Page:**<br>- Volunteer Registration Page<br>- Volunteer Contribution Page<br>- Volunteer Registration Management Page<br>- Volunteer Registration Details Page<br><br>**Component:**<br>- Volunteer Registration Form<br>- Contribution Record Table<br>- Registration Review Table<br>- Approval/Rejection Modal<br><br>**Service:**<br>- Input Validation Service<br>- Contribution Retrieval Service<br>- User Notification Service<br>- Volunteer Status Update Service<br> | **Controller:**<br>- Registration Controller<br>- Contribution Controller<br>- Management Controller<br><br>**Routes:**<br>- /volunteer/register<br>- /volunteer/contribution<br>- /admin/registration/review<br>- /admin/registration/manage<br><br>**Entity:**<br>- Volunteer Application Model<br>- Volunteer Contribution Model<br>- User Model |
| **2** | **Volunteer Assignment Module** | **Page:**<br>- Volunteer Program List Page<br>- Program Details Page<br>- Volunteer Contribution Management Page<br><br>**Component:**<br>- Program Card Display<br>- Join/Leave Button<br>- Volunteer Task List<br><br>**Service:**<br>- Task Filter Service<br>- Participation Tracking Service<br>- Volunteer Contribution Update Service| **Controller:**<br>- Volunteer Program Controller<br>- Program Update Controller<br><br>**Routes:**<br>- /volunteer/programs<br>- /volunteer/join/{id}<br>- /admin/contribution/manage<br><br>**Entity:**<br>- Volunteer Program Model<br>- Task Assignment Model |
| **3** | **Community Sharing Module** | **Page:**<br>- Community Sharing Page<br>- Reported Content Management Page<br><br>**Component**:<br>- Discussion Message Box<br>- Message List Display<br>- Report Message Button<br>- Reported Content Table<br>- Action Modal<br><br>Service:<br>- Message Management Service<br>- Real-time Update Service<br>- Report Submission Service<br>- User Notification Service<br>- Content Moderation Service | **Controller:**<br>- Discussion Controller<br>- Report Controller<br><br>**Routes:**<br>- /community/discussion<br>- /admin/reports/manage<br><br>**Entity:**<br>- Discussion Message Model<br>- Report Model<br>- User Model |
| **4** | **Integration & Testing** | **Page:**<br>- Volunteer Integration Dashboard<br><br>**Component:**<br>- Module Testing Interface<br>- Volunteer Summary Display<br><br>**Service:**<br>- System Testing Service | **Controller:**<br>- Integration Controller<br><br>**Routes:**<br>- /integration/test<br>- /integration/report<br><br>**Entity:**<br>- System Log Model |


<br><br>

## 🧩 __Yap Jia Xin’s Contribution__
## Donation Subsystem

| **Sprint** | **Module Name** | **Frontend** | **Backend** |
|-----------|------------------|--------------|--------------|
| **1** | **Donation Portal Module** | **Pages:**<br>• [Animal List Page](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/animal-list.tsx)<br>• [Animal Details Page](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/animal-details.tsx)<br>• [Donation Page](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/donation.tsx)<br><br>**Admin Pages:**<br>• [Admin Pages Folder](https://github.com/Jiaxin061/Blacksheep/tree/jiaxin/app/admin) | **Controllers:**<br>• [Admin Controller](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/server/controllers/adminController.js)<br>• [Animals Controller](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/server/controllers/animalsController.js)<br>• [Donation Controller](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/server/controllers/donationController.js)<br><br>**Routes:**<br>• [Admin Route](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/server/routes/admin.js)<br>• [Animals Route](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/server/routes/animals.js)<br>• [Donations Route](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/server/routes/donations.js)<br><br>**Database:**<br>• [Database Folder](https://github.com/Jiaxin061/Blacksheep/tree/jiaxin/server/database) |
| **2** | **Fund Tracking Module** | **User Pages:**<br>• [Donation Impact Overview](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/donation-impact.tsx)<br>• [Animal Donation Impact](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/donation-impact/%5BanimalID%5D.tsx)<br>• [Donation Receipt Page](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/donation-impact/receipt/%5BtransactionID%5D.tsx)<br><br>**Admin Pages:**<br>• [Fund Allocation Dashboard](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/admin/fund-allocation/index.tsx)<br>• [Animal Fund Allocation](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/admin/fund-allocation/%5BanimalID%5D.tsx)<br>• [Add Fund Allocation](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/admin/fund-allocation/%5BanimalID%5D/add.tsx)<br>• [Allocation Details](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/admin/fund-allocation/%5BanimalID%5D/%5BallocationID%5D.tsx) | **Controller:**<br>• [Fund Allocation Controller](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/server/controllers/fundAllocationController.js)<br><br>**Database:**<br>• [Database Folder](https://github.com/Jiaxin061/Blacksheep/tree/jiaxin/server/database) |
| **3** | **Sponsor & Partnership (Rewards) Module** | **User Pages:**<br>• [Rewards Catalogue](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/rewards/catalogue.tsx)<br>• [Rewards History](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/rewards/history.tsx)<br>• [Voucher Page](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/rewards/voucher.tsx)<br>• [Reward Details](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/rewards/%5BrewardID%5D.tsx)<br><br>**Admin Pages:**<br>• [Rewards Management](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/admin/rewards/index.tsx)<br>• [Add Reward](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/admin/rewards/add.tsx)<br>• [Edit Reward](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/app/admin/rewards/edit/%5BrewardID%5D.tsx) | **Controller:**<br>• [Reward Controller](https://github.com/Jiaxin061/Blacksheep/blob/jiaxin/server/controllers/rewardController.js)<br><br>**Database:**<br>• [Database Folder](https://github.com/Jiaxin061/Blacksheep/tree/jiaxin/server/database) |
| **4** | **Integration & Testing** | **Page:**<br>• Donation Integration Dashboard<br><br>**Components:**<br>• System Testing Interface<br>• Donation Summary Report | **Controller:**<br>• Integration Controller<br><br>**Routes:**<br>• /integration/test<br>• /integration/report<br><br>**Entity:**<br>• System Log Model |

<br><br>



