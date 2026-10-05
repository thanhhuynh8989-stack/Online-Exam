/**
 * Config.gs
 * Central configuration
 */

const APP = {
  NAME: "KLDT",
  VERSION: "2.0.0"
};

const DB = {
  MASTER: {
    ID: "1zOfTaYIQQnPDcacVAl9mHOJQuU2kacqtKhIN4eMrUHs"
  },
  DATA: {
    ID: "1aOZ1wg6s1COtCTZAMEag_DWb_r7c63sZ8zMiekx_Bg8"
  },
  FOLDER: {
    ID: "1mzJQ1il36eLy15PG_YzDSc80jKZAG4mz"
  }
};

const SHEET = {
  MASTER:{
    CONFIG:"CONFIG",
    TKB:"TKB",
    GVCH:"GVCH",
    GVKN:"GVKN",
    HE_THONG_MA_MON:"HE_THONG_MA_MON",
    HS:"hs"
  },
  DATA:{
    CONFIG:"CONFIG",
    DS_GV:"DS_GV",
    USER_CACHE:"USER_CACHE",
    FORM_GD:"FORM_GD",
    FORM_CB:"FORM_CB",
    FORM_CH:"FORM_CH",
    FORM_KN:"FORM_KN",
    FORM_KTHP:"FORM_KTHP"
  }
};

const CACHE_KEY={
  CONFIG:"CONFIG",
  USER:"USER",
  TKB:"TKB",
  TEACHER:"TEACHER"
};

const PROPERTY_KEY={
  LAST_SYNC:"LAST_SYNC",
  LAST_UPLOAD:"LAST_UPLOAD"
};

function masterSS(){
  return SpreadsheetApp.openById(DB.MASTER.ID);
}

function dataSS(){
  return SpreadsheetApp.openById(DB.DATA.ID);
}

function teacherFolder(){
  return DriveApp.getFolderById(DB.FOLDER.ID);
}

function getMasterSheet(name){
  const sh=masterSS().getSheetByName(name);
  if(!sh) throw new Error("Không tìm thấy sheet MASTER: "+name);
  return sh;
}

function getDataSheet(name){
  const sh=dataSS().getSheetByName(name);
  if(!sh) throw new Error("Không tìm thấy sheet DATA_UPDATE: "+name);
  return sh;
}

function loadSystemConfig(){
  const sh=getMasterSheet(SHEET.MASTER.CONFIG);
  const values=sh.getDataRange().getValues();
  const cfg={};
  for(let i=1;i<values.length;i++){
    const k=String(values[i][0]||"").trim();
    if(k) cfg[k]=values[i][1];
  }
  return cfg;
}

function getCache(){
  return CacheService.getScriptCache();
}

function setSystemProperty(key,value){
  PropertiesService.getScriptProperties().setProperty(key,String(value));
}

function getSystemProperty(key){
  return PropertiesService.getScriptProperties().getProperty(key);
}

function clearAllCache(){
  getCache().removeAll([
    CACHE_KEY.CONFIG,
    CACHE_KEY.USER,
    CACHE_KEY.TKB,
    CACHE_KEY.TEACHER
  ]);
}
