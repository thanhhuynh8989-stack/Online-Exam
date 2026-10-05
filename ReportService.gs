/**
 * ReportService.gs
 * Reporting & Statistics
 */

class ReportService{

  constructor(){
    this.teacherRepo = new TeacherRepository();
    this.tkbRepo = new TKBRepository();
  }

  summaryTeacher(maGV){

    const teacher = this.teacherRepo.findByCode(maGV);

    if(!teacher){
      return {
        success:false,
        message:"Không tìm thấy giảng viên."
      };
    }

    const values = this.tkbRepo.getAll();

    if(values.length<2){
      return {
        success:true,
        teacher:teacher,
        totalClasses:0,
        totalHours:0,
        rows:[]
      };
    }

    const header = values[0];

    const rows = values.slice(1).filter(r=>{
      return NormalizeUtil.code(String(r[0]||""))===NormalizeUtil.code(maGV);
    });

    let totalHours = 0;

    rows.forEach(r=>{
      r.forEach(v=>{
        if(ValidationUtil.isNumber(v)){
          totalHours += Number(v);
        }
      });
    });

    return {
      success:true,
      teacher:teacher,
      totalClasses:rows.length,
      totalHours:totalHours,
      rows:[header].concat(rows)
    };
  }

  summaryAll(){

    const teachers = this.teacherRepo.findAll();

    const report = teachers.map(t=>{

      const ma =
        t.MaGV ||
        t["Mã GV"] ||
        "";

      const rs = this.summaryTeacher(ma);

      return {
        maGV:ma,
        hoTen:t.HoTen || t["Họ tên"] || "",
        totalClasses:rs.totalClasses || 0,
        totalHours:rs.totalHours || 0
      };

    });

    return {
      success:true,
      totalTeachers:report.length,
      report:report
    };
  }

  dashboard(){

    const all = this.summaryAll();

    const totalHours = ArrayUtils.sum(
      all.report.map(r=>r.totalHours)
    );

    const totalClasses = ArrayUtils.sum(
      all.report.map(r=>r.totalClasses)
    );

    return {
      success:true,
      dashboard:{
        teachers:all.totalTeachers,
        classes:totalClasses,
        hours:totalHours,
        lastSync:getSystemProperty(PROPERTY_KEY.LAST_SYNC)
      }
    };
  }

}

/*******************
 * PUBLIC API
 *******************/

function aggregateAllTeachersVolume(){
  return new ReportService().summaryAll();
}

function loadTeacherReport(maGV){
  return new ReportService().summaryTeacher(maGV);
}

function loadDashboard(){
  return new ReportService().dashboard();
}
