(()=>{const c=window.APP_CONFIG||{},ok=window.supabase&&c.SUPABASE_URL&&!c.SUPABASE_URL.includes("YOUR_PROJECT_ID")&&c.SUPABASE_PUBLISHABLE_KEY&&!c.SUPABASE_PUBLISHABLE_KEY.includes("YOUR_");window.apiReady=!!ok;if(!ok){window.db=null;return}
window.db=window.supabase.createClient(c.SUPABASE_URL,c.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const cache={get(k){try{const x=JSON.parse(localStorage.getItem("oe:"+k)||"null");return x&&(!x.expires||x.expires>Date.now())?x.value:null}catch(e){return null}},set(k,v,t=300000){try{localStorage.setItem("oe:"+k,JSON.stringify({value:v,expires:Date.now()+t}))}catch(e){}},del(k){try{localStorage.removeItem("oe:"+k)}catch(e){}}};
window.API={
async session(){const r=await db.auth.getSession();if(r.error)throw r.error;return r.data.session},
async signIn(email,password){const r=await db.auth.signInWithPassword({email,password});if(r.error)throw r.error;return r.data},
async signUp(email,password,name){const r=await db.auth.signUp({email,password,options:{data:{full_name:name||""}}});if(r.error)throw r.error;return r.data},
async signOut(){const r=await db.auth.signOut();if(r.error)throw r.error;cache.del("courses")},
async profile(){const u=await db.auth.getUser();if(u.error)throw u.error;if(!u.data.user)return null;const r=await db.from("profiles").select("id,email,full_name,role").eq("id",u.data.user.id).maybeSingle();if(r.error)throw r.error;return r.data||{id:u.data.user.id,email:u.data.user.email,full_name:u.data.user.user_metadata?.full_name||"",role:"teacher"}},
async courses(){const x=cache.get("courses");if(x)return x;const r=await db.from("courses").select("id,course_code,course_name,credits,is_active").eq("is_active",true).order("course_code");if(r.error)throw r.error;cache.set("courses",r.data||[],600000);return r.data||[]},
async stats(id){const r=await db.rpc("get_course_stats",{p_course_id:id});if(r.error)throw r.error;return r.data||{}},
async topics(id){const r=await db.from("topics").select("id,topic_code,topic_name").eq("course_id",id).eq("is_active",true).order("topic_name");if(r.error)throw r.error;return r.data||[]},
async questions(o){let q=db.from("questions").select("id,question_code,course_id,topic_id,question_text,option_a,option_b,option_c,option_d,correct_option,points,category,difficulty,is_active,topics(topic_name)",{count:"exact"}).eq("course_id",o.courseId).eq("is_active",true);if(o.search)q=q.ilike("question_text","%"+o.search+"%");if(o.difficulty)q=q.eq("difficulty",o.difficulty);const a=(o.page-1)*o.size,r=await q.order("question_code").range(a,a+o.size-1);if(r.error)throw r.error;return{data:r.data||[],count:r.count||0,page:o.page,size:o.size}},
async addQuestion(p){const r=await db.from("questions").insert(p).select().single();if(r.error)throw r.error;return r.data},
async updateQuestion(id,p){const r=await db.from("questions").update(p).eq("id",id).select().single();if(r.error)throw r.error;return r.data},
async deleteQuestion(id){const r=await db.from("questions").update({is_active:false}).eq("id",id);if(r.error)throw r.error},
async exams(courseId){const r=await db.from("exams").select("*").eq("course_id",courseId).order("created_at",{ascending:false});if(r.error)throw r.error;return r.data||[]},
async createExam(p){const r=await db.rpc("create_exam",p);if(r.error)throw r.error;return r.data},
async editor(id){const r=await db.rpc("get_exam_editor",{p_exam_id:id});if(r.error)throw r.error;return r.data},
async available(id,page,search){const r=await db.rpc("get_available_questions",{p_exam_id:id,p_page:page,p_page_size:20,p_search:search||""});if(r.error)throw r.error;return r.data},
async addToExam(id,ids){const r=await db.rpc("add_questions_to_exam",{p_exam_id:id,p_question_ids:ids});if(r.error)throw r.error;return r.data},
async removeFromExam(id){const r=await db.rpc("remove_question_from_exam",{p_exam_question_id:id});if(r.error)throw r.error}
};window.oeCache=cache})()