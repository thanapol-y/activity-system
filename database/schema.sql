-- =============================================
-- Activity Registration System - Database Schema
-- =============================================
-- ใช้ไฟล์นี้สร้างตารางทั้งหมด
-- จากนั้นใช้ insert_data.sql เพื่อเพิ่มข้อมูลตัวอย่าง
-- =============================================

CREATE DATABASE IF NOT EXISTS activity_system;
USE activity_system;

CREATE TABLE faculty (
    Faculty_ID VARCHAR(20) PRIMARY KEY,
    Faculty_Name VARCHAR(100) NOT NULL
);

CREATE TABLE branch (
    Branch_ID VARCHAR(20) PRIMARY KEY,
    Branch_Name VARCHAR(100) NOT NULL,
    Faculty_ID VARCHAR(20),
    FOREIGN KEY (Faculty_ID) REFERENCES faculty(Faculty_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE department (
    Department_ID VARCHAR(20) PRIMARY KEY,
    Department_Name VARCHAR(150) NOT NULL
);

CREATE TABLE activity_type (
    Activity_Type_ID VARCHAR(20) PRIMARY KEY,
    Activity_Type_Name VARCHAR(100) NOT NULL
);

CREATE TABLE admin (
    Admin_ID VARCHAR(20) PRIMARY KEY,
    Admin_Name VARCHAR(100) NOT NULL,
    Admin_Password VARCHAR(255) NOT NULL,
    Admin_Email VARCHAR(100)
);

CREATE TABLE gender (
    Gender_ID VARCHAR(20) PRIMARY KEY,
    Gender_Name VARCHAR(100) NOT NULL
);

CREATE TABLE student (
    Student_ID VARCHAR(20) PRIMARY KEY,
    Student_Name VARCHAR(100) NOT NULL,
    Student_Password VARCHAR(255) NOT NULL,
    Faculty_ID VARCHAR(20),
    Branch_ID VARCHAR(20),
    Student_Email VARCHAR(100),
    Student_Phone VARCHAR(20),
    Gender_ID VARCHAR(20),
    FOREIGN KEY (Faculty_ID) REFERENCES faculty(Faculty_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Branch_ID) REFERENCES branch(Branch_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Gender_ID) REFERENCES gender(Gender_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE dean (
    Dean_ID VARCHAR(20) PRIMARY KEY,
    Dean_Name VARCHAR(100) NOT NULL,
    Dean_Password VARCHAR(255) NOT NULL,
    Department_ID VARCHAR(20),
    Dean_Email VARCHAR(100),
    FOREIGN KEY (Department_ID) REFERENCES department(Department_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE activity_head (
    Activity_Head_ID VARCHAR(20) PRIMARY KEY,
    Activity_Head_Name VARCHAR(100) NOT NULL,
    Activity_Head_Password VARCHAR(255) NOT NULL,
    Department_ID VARCHAR(20),
    Activity_Head_Email VARCHAR(100),
    Activity_Head_Phone VARCHAR(50),
    FOREIGN KEY (Department_ID) REFERENCES department(Department_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE club (
    Club_ID VARCHAR(20) PRIMARY KEY,
    Club_Name VARCHAR(100) NOT NULL,
    Club_Password VARCHAR(255) NOT NULL,
    Faculty_ID VARCHAR(20),
    Branch_ID VARCHAR(20),
    Club_Email VARCHAR(100),
    FOREIGN KEY (Faculty_ID) REFERENCES faculty(Faculty_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Branch_ID) REFERENCES branch(Branch_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE activity (
    Activity_ID VARCHAR(20) PRIMARY KEY,
    Activity_Name VARCHAR(100) NOT NULL,
    Activity_Details TEXT,
    Academic_Year INT,
    Activity_Type_ID VARCHAR(20),
    Activity_Date DATE,
    Activity_Time TIME,
    Activity_Location VARCHAR(100),
    Maximum_Capacity INT,
    Deadline DATETIME,
    Activity_Status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    Dean_ID VARCHAR(20),
    Activity_Head_ID VARCHAR(20),
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Activity_Type_ID) REFERENCES activity_type(Activity_Type_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Dean_ID) REFERENCES dean(Dean_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Activity_Head_ID) REFERENCES activity_head(Activity_Head_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE registration (
    Student_ID VARCHAR(20),
    Activity_ID VARCHAR(20),
    Registration_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    QR_Code_Data TEXT,
    Registration_Status ENUM('registered', 'cancelled') DEFAULT 'registered',
    PRIMARY KEY (Student_ID, Activity_ID),
    FOREIGN KEY (Student_ID) REFERENCES student(Student_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Activity_ID) REFERENCES activity(Activity_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE check_in (
    Student_ID VARCHAR(20),
    Activity_ID VARCHAR(20),
    Club_ID VARCHAR(20),
    CheckIn_Time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Student_ID, Activity_ID),
    FOREIGN KEY (Student_ID) REFERENCES student(Student_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Activity_ID) REFERENCES activity(Activity_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Club_ID) REFERENCES club(Club_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE problem_report (
    Report_ID INT AUTO_INCREMENT PRIMARY KEY,
    Activity_ID VARCHAR(20) NOT NULL,
    Club_ID VARCHAR(20) NOT NULL,
    Report_Text TEXT NOT NULL,
    Report_Status ENUM('pending', 'acknowledged', 'resolved') DEFAULT 'pending',
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Activity_ID) REFERENCES activity(Activity_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Club_ID) REFERENCES club(Club_ID) ON DELETE CASCADE ON UPDATE CASCADE
);
