/**
 * UploadService.gs
 * Import timetable to MASTER.TKB
 */

class UploadService{

  constructor(){
    this.sheet = getMasterSheet(SHEET.MASTER.TKB);
  }

  importRows(rows){

    if(!ValidationUtil.isArray(rows)){
      return {success:false,message:"Dữ liệu không hợp lệ."};
    }

    const valid = rows.filter(r=>!ValidationUtil.isEmptyRow(r));

    if(valid.length===0){
      return {success:false,message:"Không có dữ liệu."};
    }

    const start = this.sheet.getLastRow()+1;

    SpreadsheetUtils.writeValues(
      this.sheet,
      start,
      1,
      valid
    );

    setSystemProperty(
      PROPERTY_KEY.LAST_UPLOAD,
      DateUtils.format(new Date())
    );

    return {
      success:true,
      inserted:valid.length
    };
  }

  replaceAll(rows){

    SpreadsheetUtils.clear(this.sheet,2);

    return this.importRows(rows);
  }

  removeDuplicate(rows){

    const map={};
    const out=[];

    rows.forEach(r=>{
      const key = HashUtil.md5(JSON.stringify(r));
      if(!map[key]){
        map[key]=true;
        out.push(r);
      }
    });

    return out;
  }

  validate(rows){

    const errors=[];

    rows.forEach((r,i)=>{
      if(ValidationUtil.isEmptyRow(r)){
        errors.push({
          row:i+1,
          message:"Dòng rỗng."
        });
      }
    });

    return errors;
  }

  upload(rows){

    const errors=this.validate(rows);

    if(errors.length){
      return{
        success:false,
        errors:errors
      };
    }

    const data=this.removeDuplicate(rows);

    return this.importRows(data);

  }

}

/********************
 * PUBLIC API
 ********************/

function uploadTkbRows(rows){
  return new UploadService().upload(rows);
}

function replaceTkbRows(rows){
  return new UploadService().replaceAll(rows);
}
