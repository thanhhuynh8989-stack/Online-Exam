/**
 * TemplateService.gs
 * Create and initialize teacher files from templates.
 */

class TemplateService{

  constructor(){
    this.templateRepo = new TemplateRepository();
    this.fileRepo = new TeacherFileRepository();
    this.teacherRepo = new TeacherRepository();
  }

  getTemplate(type){
    switch(String(type).toUpperCase()){
      case "GVKN":
        return this.templateRepo.getGVKN();
      case "GVCH":
      default:
        return this.templateRepo.getGVCH();
    }
  }

  createTeacherFile(maGV,type){

    const teacher = this.teacherRepo.findByCode(maGV);

    if(!teacher){
      return {
        success:false,
        message:"Không tìm thấy giảng viên."
      };
    }

    const fileName =
      (teacher.MaGV || teacher["Mã GV"] || maGV) +
      " - " +
      (teacher.HoTen || teacher["Họ tên"] || "");

    const exists = this.fileRepo.findByName(fileName);

    if(exists.length){
      return {
        success:true,
        existed:true,
        id:exists[0].getId(),
        url:exists[0].getUrl()
      };
    }

    const templateSheet = this.getTemplate(type);
    const templateSS = templateSheet.getParent();

    const copied = this.fileRepo.copyTemplate(
      templateSS.getId(),
      fileName
    );

    return {
      success:true,
      existed:false,
      id:copied.getId(),
      url:copied.getUrl(),
      name:copied.getName()
    };
  }

  initializeTeacherWorkbook(fileId,teacher){

    const ss = SpreadsheetApp.openById(fileId);

    let info = ss.getSheetByName("INFO");

    if(!info){
      info = ss.insertSheet("INFO");
    }

    const values = [
      ["Mã GV", teacher.MaGV || teacher["Mã GV"] || ""],
      ["Họ tên", teacher.HoTen || teacher["Họ tên"] || ""],
      ["Email", teacher.Email || ""],
      ["Ngày tạo", new Date()]
    ];

    info.clearContents();
    info.getRange(1,1,values.length,2).setValues(values);

    return true;
  }

  createAndInitialize(maGV,type){

    const rs = this.createTeacherFile(maGV,type);

    if(!rs.success){
      return rs;
    }

    if(rs.existed){
      return rs;
    }

    const teacher = this.teacherRepo.findByCode(maGV);

    this.initializeTeacherWorkbook(
      rs.id,
      teacher
    );

    return rs;
  }

}

/*******************
 * PUBLIC API
 *******************/

function createTeacherTemplate(maGV,type){
  return new TemplateService()
    .createAndInitialize(maGV,type);
}
