# Blacksheep

# 📱 App Development Project — Section 02

## 👥 Group Members
- **Yap Jia Xin**  
- **Chang Wei Lam**  
- **Karen Voon Xiu Wen**  
- **Tan Qing Qing**

## 🧩 Project Overview
This project was developed as part of **Section 02’s App Development coursework**.  
Our team collaborated to design and implement a functional mobile application that emphasizes usability, performance, and clean interface design.


## 🧩 __Karen’s Contribution__ 
## Animal Reporting and Rescue Subsystem

| **Sprint** | **Module Name** | **Frontend** | **Backend** |
|-------------|-----------------|---------------|--------------|
| **1** | **Stray Animal Reporting Module** | **Page:**<br>- [`ReportAnimalScreen`](./SavePawsFrontend/src/screens/ReportAnimalScreen.js) - Submit new reports<br>• [`ViewReportsScreen`](./SavePawsFrontend/src/screens/ViewReportsScreen.js) - Browse all reports<br>• [`AdminDashboardScreen`](./SavePawsFrontend/src/screens/AdminDashboardScreen.js) - View statistics<br>• [`AdminManageScreen`](./SavePawsFrontend/src/screens/AdminManageScreen.js) - Manage reports<br>• <br>**Component:**<br>- Animal Report Form<br>- Report List Table<br><br>**Service:**<br>- Location Access Service<br>- Image Upload Function |  **Controllers:**<br>• [`reportController.js`](./SavePawsBackend/controllers/reportController.js) - Business logic<br><br>**Routes:**<br>• [`reports.js`](./SavePawsBackend/routes/reports.js)<br>  - `GET /api/reports` - Get all reports<br>  - `GET /api/reports/:id` - Get single report<br>  - `POST /api/reports` - Create report<br>  - `PATCH /api/reports/:id/status` - Update status<br>  - `DELETE /api/reports/:id` - Delete report<br>  - `GET /api/reports/stats` - Get statistics<br><br>**Models:**<br>• [`Report.js`](./SavePawsBackend/models/Report.js) - Report data model<br><br>**Configuration:**<br>• [`database.js`](./SavePawsBackend/config/database.js) - MySQL connection<br>• [`initDatabase.js`](./SavePawsBackend/config/initDatabase.js) - Database setup<br><br>**Middleware:**<br>• [`logger.js`](./SavePawsBackend/middleware/logger.js) - Request logging<br>• [`errorHandler.js`](./SavePawsBackend/middleware/errorHandler.js) - Error handling |
| **2** | **Rescue Task Management Module** | **Page:**<br>- Rescue Task Page<br>- Task Assignment Page<br><br>**Component:**<br>- Task Card Display<br>- Volunteer Task List<br><br>**Service:**<br>- Task Filter Service | **Controller:**<br>- Rescue Task Controller<br><br>**Routes:**<br>- /rescue/assign<br>- /rescue/tasks<br><br>**Entity:**<br>- Rescue Task Model |
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
|-------------|-----------------|---------------|--------------|
| **1** | **Donation Portal Module** | **Page:**<br>- Donation Listing Page<br>- Donation Details Page<br><br>**Component:**<br>- Animal Donation Card<br>- Donation Details Modal<br><br>**Service:**<br>- PayPal Payment Integration Service<br>- Donation Filter & Search Service | **Controller:**<br>- Donation Controller<br><br>**Routes:**<br>- /donation/list<br>- /donation/details<br>- /donation/payment<br><br>**Entity:**<br>- Donation Model |
| **2** | **Fund Tracking Module** | **Page:**<br>- Fund Overview Page<br>- Donation History Page<br><br>**Component:**<br>- Fund Summary Chart<br>- Transaction Record Table<br><br>**Service:**<br>- Fund Calculation Service<br>- Report Generation Service | **Controller:**<br>- Fund Controller<br><br>**Routes:**<br>- /fund/overview<br>- /fund/history<br><br>**Entity:**<br>- Fund Model<br>- Transaction Model |
| **3** | **Sponsorship & Partnership Module** | **Page:**<br>- Sponsorship Program Page<br>- Partnership Registration Page<br><br>**Component:**<br>- Sponsor Information Form<br>- Partnership Card Display<br><br>**Service:**<br>- Sponsorship Management Service<br>- Partner Inquiry Handling Service | **Controller:**<br>- Sponsorship Controller<br><br>**Routes:**<br>- /sponsorship/programs<br>- /partnership/register<br><br>**Entity:**<br>- Sponsor Model<br>- Partner Model |
| **4** | **Integration & Testing** | **Page:**<br>- Donation Integration Dashboard<br><br>**Component:**<br>- System Testing Interface<br>- Donation Summary Report<br><br>**Service:**<br>- Integration Testing Service | **Controller:**<br>- Integration Controller<br><br>**Routes:**<br>- /integration/test<br>- /integration/report<br><br>**Entity:**<br>- System Log Model |

<br><br>



