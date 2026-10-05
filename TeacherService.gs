/**
 * TeacherService.gs
 * Teacher business logic
 */

class TeacherService {

  constructor(){
    this.repo = new TeacherRepository();
    this.fileRepo = new TeacherFileRepository();
  }

  getAllTeachers(){
    return this.repo.findAll();
  }

  getTeacher(maGV){
    return this.repo.findByCode(maGV);
  }

  search(keyword){
    keyword = NormalizeUtil.removeAccent(
      NormalizeUtil.text(keyword)
    ).toLowerCase();

    return this.getAllTeachers().filter(t=>{
      const text = NormalizeUtil.removeAccent(
        JSON.stringify(t)
      ).toLowerCase();
      return text.indexOf(keyword)>=0;
    });
  }

  getAccessibleTeachers(sessionId){

    const session = AuthService.requireLogin(sessionId);

    if(session.role==="ADMIN"){
      return this.getAllTeachers();
    }

    const teacher = this.getTeacher(session.maGV);

    return teacher ? [teacher] : [];
  }

  getTeacherFile(maGV){

    const teacher = this.getTeacher(maGV);

    if(!teacher) return null;

    const name =
      teacher.HoTen ||
      teacher["Họ tên"] ||
      teacher.Name ||
      "";

    const files = this.fileRepo.findByName(name);

    if(files.length===0) return null;

    return {
      id: files[0].getId(),
      name: files[0].getName(),
      url: files[0].getUrl()
    };

  }

  createTeacherResponse(maGV){

    const teacher = this.getTeacher(maGV);

    if(!teacher){
      return {
        success:false,
        message:"Không tìm thấy giảng viên."
      };
    }

    return {
      success:true,
      teacher:teacher,
      file:this.getTeacherFile(maGV)
    };

  }

}

/***************
 * PUBLIC API
 ***************/

function getAccessibleTeachers(sessionId){
  return new TeacherService()
    .getAccessibleTeachers(sessionId);
}

function getTeacherDetails(maGV){
  return new TeacherService()
    .createTeacherResponse(maGV);
}
