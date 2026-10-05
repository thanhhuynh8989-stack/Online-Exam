/**
 * OverrideService.gs
 * Manage teacher override data
 */

class OverrideService{

  constructor(){
    this.sheet = getDataSheet(SHEET.DATA.FORM_GD);
  }

  load(maGV){

    const values = SpreadsheetUtils.getValues(this.sheet);
    if(values.length<2){
      return {success:true,data:[]};
    }

    const header = values[0];
    const data = values.slice(1).filter(r=>{
      return NormalizeUtil.code(String(r[0]||""))===NormalizeUtil.code(maGV);
    }).map(r=>{
      const obj={};
      header.forEach((h,i)=>obj[String(h).trim()]=r[i]);
      return obj;
    });

    return {
      success:true,
      data:data
    };
  }

  save(maGV,records){

    if(!ValidationUtil.isArray(records)){
      return {success:false,message:"records không hợp lệ"};
    }

    const values = SpreadsheetUtils.getValues(this.sheet);
    const header = values[0];
    const rows = values.slice(1).filter(r=>{
      return NormalizeUtil.code(String(r[0]||""))!==NormalizeUtil.code(maGV);
    });

    records.forEach(obj=>{
      const row = header.map(h=>obj[h]!==undefined?obj[h]:"");
      rows.push(row);
    });

    SpreadsheetUtils.clear(this.sheet,2);
    SpreadsheetUtils.writeValues(this.sheet,2,1,rows);

    return {
      success:true,
      total:records.length
    };
  }

  merge(maGV){

    const teacher = new TeacherService().getTeacher(maGV);
    const override = this.load(maGV);

    return {
      success:true,
      teacher:teacher,
      override:override.data
    };
  }

}

/*************
 * PUBLIC API
 *************/

function loadTeacherCentralOverrideData(maGV){
  return new OverrideService().load(maGV);
}

function saveTeacherCentralOverrideData(maGV,data){
  return new OverrideService().save(maGV,data);
}

function mergeTeacherOverride(maGV){
  return new OverrideService().merge(maGV);
}
