/**
 * Repository.gs
 * Foundation version compatible with Config.gs
 */

class BaseRepository {
  constructor(sheet){ this.sheet=sheet; }
  getAll(){ return SpreadsheetUtils.getValues(this.sheet); }
  clear(startRow=2){ SpreadsheetUtils.clear(this.sheet,startRow); }
  write(values,row=2,col=1){ SpreadsheetUtils.writeValues(this.sheet,row,col,values); }
}

class ConfigRepository extends BaseRepository{
  constructor(){ super(getMasterSheet(SHEET.MASTER.CONFIG)); }
  load(){ return loadSystemConfig(); }
}

class TeacherRepository extends BaseRepository{
  constructor(){ super(getDataSheet(SHEET.DATA.DS_GV)); }

  findAll(){
    const data=this.getAll();
    if(data.length<2) return [];
    const header=data[0];
    return data.slice(1)
      .filter(r=>!ValidationUtil.isEmptyRow(r))
      .map(r=>{
        const obj={};
        header.forEach((h,i)=>obj[String(h).trim()]=r[i]);
        return obj;
      });
  }

  findByCode(maGV){
    maGV=NormalizeUtil.code(maGV);
    return this.findAll().find(r=>
      NormalizeUtil.code(r.MaGV||r.MAGV||r['Mã GV']||'')===maGV
    )||null;
  }
}

class TKBRepository extends BaseRepository{
  constructor(){ super(getMasterSheet(SHEET.MASTER.TKB)); }
}

class UserRepository extends BaseRepository{
  constructor(){ super(getDataSheet(SHEET.DATA.USER_CACHE)); }
}

class TemplateRepository{
  getGVCH(){ return getMasterSheet(SHEET.MASTER.GVCH); }
  getGVKN(){ return getMasterSheet(SHEET.MASTER.GVKN); }
}

class TeacherFileRepository{
  getFolder(){ return teacherFolder(); }

  findByName(name){
    const files=this.getFolder().getFilesByName(name);
    const rs=[];
    while(files.hasNext()) rs.push(files.next());
    return rs;
  }

  copyTemplate(templateId,newName){
    return DriveUtils.copy(templateId,newName,this.getFolder());
  }
}
