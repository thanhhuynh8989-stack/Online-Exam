/**
 * SyncService.gs
 * Synchronize TKB -> Teacher files
 */

class SyncService {

  constructor(){
    this.tkbRepo = new TKBRepository();
    this.teacherRepo = new TeacherRepository();
    this.fileRepo = new TeacherFileRepository();
  }

  syncTeacher(maGV){

    const teacher = this.teacherRepo.findByCode(maGV);

    if(!teacher){
      return {
        success:false,
        message:"Không tìm thấy giảng viên."
      };
    }

    const data = this.tkbRepo.getAll();

    if(data.length<=1){
      return {
        success:false,
        message:"TKB chưa có dữ liệu."
      };
    }

    const header = data[0];

    const rows = data.slice(1).filter(r=>{
      return NormalizeUtil.code(
        r[0] || ""
      )===NormalizeUtil.code(maGV);
    });

    const files = this.fileRepo.findByName(
      teacher.HoTen ||
      teacher["Họ tên"] ||
      ""
    );

    if(files.length===0){
      return {
        success:false,
        message:"Chưa có file giảng viên."
      };
    }

    const ss = SpreadsheetApp.open(files[0]);

    let sh = ss.getSheetByName("TKB");

    if(!sh){
      sh = ss.insertSheet("TKB");
    }

    sh.clearContents();

    SpreadsheetUtils.writeValues(
      sh,
      1,
      1,
      [header].concat(rows)
    );

    return {
      success:true,
      rows:rows.length,
      fileId:files[0].getId()
    };
  }

  syncAll(){

    const teachers=this.teacherRepo.findAll();

    const result=[];

    teachers.forEach(t=>{

      const ma =
        t.MaGV ||
        t["Mã GV"] ||
        "";

      result.push(
        this.syncTeacher(ma)
      );

    });

    setSystemProperty(
      PROPERTY_KEY.LAST_SYNC,
      DateUtils.format(new Date())
    );

    return {
      success:true,
      total:result.length,
      detail:result
    };

  }

}

/**************
 * PUBLIC API
 **************/

function syncSingleTeacherTKB(maGV){
  return new SyncService().syncTeacher(maGV);
}

function syncAllTeachersTKB(){
  return new SyncService().syncAll();
}
