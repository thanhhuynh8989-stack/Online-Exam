/**
 * PublicAPI.gs
 * Public entry points called from Index.html
 */

function apiPing(){
  return {
    success:true,
    app:APP.NAME,
    version:APP.VERSION,
    time:new Date()
  };
}

/****************
 * AUTH
 ****************/

function verifyUserLogin(username,password){
  return AuthService.login(username,password);
}

function logout(sessionId){
  return AuthService.logout(sessionId);
}

/****************
 * TEACHER
 ****************/

function getAccessibleTeachers(sessionId){
  return new TeacherService().getAccessibleTeachers(sessionId);
}

function getTeacherDetails(maGV){
  return new TeacherService().createTeacherResponse(maGV);
}

/****************
 * UPLOAD
 ****************/

function uploadTkbRows(rows){
  return new UploadService().upload(rows);
}

function replaceTkbRows(rows){
  return new UploadService().replaceAll(rows);
}

/****************
 * SYNC
 ****************/

function syncSingleTeacherTKB(maGV){
  return new SyncService().syncTeacher(maGV);
}

function syncAllTeachersTKB(){
  return new SyncService().syncAll();
}

/****************
 * OVERRIDE
 ****************/

function loadTeacherCentralOverrideData(maGV){
  return new OverrideService().load(maGV);
}

function saveTeacherCentralOverrideData(maGV,data){
  return new OverrideService().save(maGV,data);
}

function mergeTeacherOverride(maGV){
  return new OverrideService().merge(maGV);
}

/****************
 * REPORT
 ****************/

function aggregateAllTeachersVolume(){
  return new ReportService().summaryAll();
}

function loadTeacherReport(maGV){
  return new ReportService().summaryTeacher(maGV);
}

function loadDashboard(){
  return new ReportService().dashboard();
}
