/**
 * Auth.gs
 * Authentication & Session
 */

class AuthService {

  static login(username,password){

    username = NormalizeUtil.text(username);
    password = NormalizeUtil.text(password);

    if(!username || !password){
      return {success:false,message:"Thiếu tài khoản hoặc mật khẩu."};
    }

    const repo = new TeacherRepository();
    const users = repo.findAll();

    const user = users.find(r=>{
      const u = NormalizeUtil.text(r.Username || r.USERNAME || r.Email || r.EMAIL);
      return u.toLowerCase() === username.toLowerCase();
    });

    if(!user){
      return {success:false,message:"Không tìm thấy tài khoản."};
    }

    const stored = String(user.Password || user.PASSWORD || "");
    if(stored && stored !== HashUtil.md5(password) && stored !== password){
      return {success:false,message:"Sai mật khẩu."};
    }

    const session = {
      id: Utilities.getUuid(),
      login: new Date().toISOString(),
      maGV: user.MaGV || user["Mã GV"] || "",
      hoTen: user.HoTen || user["Họ tên"] || "",
      email: user.Email || "",
      role: user.Role || user.ChucVu || "GV"
    };

    CacheUtil.put("SESSION_"+session.id,session,21600);

    return {
      success:true,
      sessionId:session.id,
      user:session
    };
  }

  static logout(sessionId){
    if(sessionId){
      CacheUtil.remove("SESSION_"+sessionId);
    }
    return {success:true};
  }

  static getSession(sessionId){
    if(!sessionId) return null;
    return CacheUtil.get("SESSION_"+sessionId);
  }

  static requireLogin(sessionId){
    const s=this.getSession(sessionId);
    if(!s){
      throw new Error("Phiên đăng nhập không hợp lệ.");
    }
    return s;
  }

}

function verifyUserLogin(username,password){
  return AuthService.login(username,password);
}

function logout(sessionId){
  return AuthService.logout(sessionId);
}
