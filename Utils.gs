/**
 * Utils.gs
 * Shared utility classes
 */

class LoggerUtil{
  static log(level,msg,ctx){
    Logger.log(JSON.stringify({
      time:new Date(),
      level:level,
      message:msg,
      context:ctx||{}
    }));
  }
  static info(m,c){this.log("INFO",m,c);}
  static warn(m,c){this.log("WARN",m,c);}
  static error(m,c){this.log("ERROR",m,c);}
}

class HashUtil{
  static md5(s){
    const b=Utilities.computeDigest(Utilities.DigestAlgorithm.MD5,String(s));
    return b.map(x=>('0'+((x<0?x+256:x).toString(16))).slice(-2)).join('');
  }
  static uuid(){return Utilities.getUuid();}
}

class RetryUtil{
  static execute(fn,maxAttempts=3,delay=1000){
    let last;
    for(let i=0;i<maxAttempts;i++){
      try{return fn();}
      catch(e){last=e;if(i<maxAttempts-1)Utilities.sleep(delay);}
    }
    throw last;
  }
}

class CacheUtil{
  static get(k){
    const v=getCache().get(k);
    return v?JSON.parse(v):null;
  }
  static put(k,v,ttl=21600){
    getCache().put(k,JSON.stringify(v),ttl);
  }
  static remove(k){getCache().remove(k);}
}

class LockUtil{
  static run(fn,timeout=30000){
    const l=LockService.getScriptLock();
    if(!l.tryLock(timeout)) throw new Error("Cannot acquire lock");
    try{return fn();}finally{l.releaseLock();}
  }
}

class RemoveAccentUtil{
  static strip(s){
    if(!s) return "";
    return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D");
  }
}

class NormalizeUtil{
  static text(v){return String(v??"").trim().replace(/\s+/g," ");}
  static code(v){return this.text(v).toUpperCase().replace(/\s+/g,"");}
  static removeAccent(v){return RemoveAccentUtil.strip(v);}
}

class ValidationUtil{
  static isRequired(v){return !(v===null||v===undefined||String(v).trim()==="");}
  static isEmptyRow(r){return r.every(v=>String(v??"").trim()==="");}
  static isNumber(v){return !isNaN(v);}
  static isArray(v){return Array.isArray(v);}
  static isObject(v){return typeof v==="object"&&v!==null;}
  static isEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||""));}
}

class DateUtils{
  static format(d,f="yyyy-MM-dd HH:mm:ss"){
    return Utilities.formatDate(new Date(d),Session.getScriptTimeZone(),f);
  }
  static now(){return new Date();}
}

class ArrayUtils{
  static unique(a){return [...new Set(a)];}
  static sum(a){return a.reduce((s,v)=>s+Number(v||0),0);}
  static indexBy(arr,key){
    const o={};
    arr.forEach(r=>{if(r&&r[key]!=null)o[r[key]]=r;});
    return o;
  }
}

class SpreadsheetUtils{
  static getValues(sheet){
    return RetryUtil.execute(()=>sheet.getDataRange().getValues());
  }
  static writeValues(sheet,row,col,data){
    if(!data||data.length===0)return;
    sheet.getRange(row,col,data.length,data[0].length).setValues(data);
  }
  static clear(sheet,startRow=2){
    if(sheet.getLastRow()<startRow)return;
    sheet.getRange(startRow,1,sheet.getLastRow()-startRow+1,sheet.getLastColumn()).clearContent();
  }
}

class DriveUtils{
  static copy(fileId,name,folder){
    return DriveApp.getFileById(fileId).makeCopy(name,folder);
  }
  static folder(){return teacherFolder();}
}

class ObjectUtils{
  static clone(o){return JSON.parse(JSON.stringify(o));}
}

class StringUtils{
  static empty(v){return v==null?"":String(v);}
}

class ErrorUtil{
  static throw(msg){throw new Error(msg);}
}
