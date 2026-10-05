function getDatabase() {



  const databaseId = CONFIG.DATABASE_ID;



  if (!databaseId) {

    throw new Error('DATABASE_ID đang trống.');

  }



  Logger.log('DATABASE_ID đang sử dụng: ' + databaseId);



  return SpreadsheetApp.openById(databaseId);

}





function getSheet(sheetName) {



  const ss = getDatabase();



  const sheet = ss.getSheetByName(sheetName);



  if (!sheet) {

    throw new Error(

      'Không tìm thấy sheet: ' + sheetName

    );

  }



  return sheet;

}





function getSheetData(sheetName) {



  const sheet = getSheet(sheetName);



  const lastRow = sheet.getLastRow();

  const lastColumn = sheet.getLastColumn();



  if (lastRow < 2) {

    return [];

  }



  const values = sheet

    .getRange(1, 1, lastRow, lastColumn)

    .getValues();



  const headers = values[0];



  return values.slice(1).map(function(row) {



    const item = {};



    headers.forEach(function(header, index) {

      item[header] = row[index];

    });



    return item;



  });

}





function getTeachers() {

  return getSheetData(CONFIG.SHEETS.TEACHERS);

}





function getCourses() {

  return getSheetData(CONFIG.SHEETS.COURSES);

}





function getClasses() {

  return getSheetData(CONFIG.SHEETS.CLASSES);

}





function getQuestions() {

  return getSheetData(CONFIG.SHEETS.QUESTIONS);

}





function getExams() {

  return getSheetData(CONFIG.SHEETS.EXAMS);

}



function getCourseById(courseId) {



  const courses = getCourses();



  for (let i = 0; i < courses.length; i++) {



    if (String(courses[i].course_id) === String(courseId)) {



      return courses[i];



    }



  }



  return null;

}



function getClassesByCourse(courseId) {



  const classes = getClasses();



  return classes.filter(function(item) {



    return String(item.course_id) === String(courseId);



  });



}



function getQuestionsByCourse(courseId) {



  if (!courseId) {



    throw new Error(

      'Thiếu mã học phần.'

    );



  }





  const questions =

    getQuestions();





  return questions.filter(

    function(item) {



      const isActive =

        String(

          item.is_active

        )

        .toUpperCase()

        .trim();





      return (

        String(item.course_id)

          .trim() ===

        String(courseId)

          .trim()

        &&

        isActive === 'TRUE'

      );



    }

  );



}



function getExamsByCourse(courseId) {



  const exams = getExams();



  const classes =

    getClassesByCourse(courseId);



  const classIds =

    classes.map(function(item) {



      return String(item.class_id);



    });





  return exams.filter(function(exam) {



    return classIds.indexOf(

      String(exam.class_id)

    ) !== -1;



  });



}



function getCourseDashboard(courseId) {



  const course =

    getCourseById(courseId);





  if (!course) {



    throw new Error(

      'Không tìm thấy học phần.'

    );



  }





  const classes =

    getClassesByCourse(courseId);





  const questions =

    getQuestionsByCourse(courseId);





  const exams =

    getExamsByCourse(courseId);





  return {



    course: course,



    classes: classes,



    questions: questions,



    exams: exams,



    statistics: {



      classCount:

        classes.length,



      questionCount:

        questions.length,



      examCount:

        exams.length



    }



  };



}



function getQuestionBank(courseId) {



  if (!courseId) {



    throw new Error(

      'Thiếu mã học phần.'

    );



  }





  // =======================================================

  // LẤY THÔNG TIN HỌC PHẦN

  // =======================================================



  const course =

    getCourseById(courseId);





  if (!course) {



    throw new Error(

      'Không tìm thấy học phần.'

    );



  }





  // =======================================================

  // LẤY CÂU HỎI KÈM THÔNG TIN CHỦ ĐỀ

  // =======================================================



  const questions =

    getQuestionsGroupedByTopic(

      courseId

    );





  // =======================================================

  // TRẢ DỮ LIỆU CHO GIAO DIỆN

  // =======================================================



  return {



    course:

      course,



    questions:

      questions,



    total:

      questions.length



  };



}



/\*\*

 \* =========================================================

 \* THÊM CÂU HỎI

 \* =========================================================

 \*/



function addQuestion(data) {



  // =======================================================

  // KIỂM TRA DỮ LIỆU ĐẦU VÀO

  // =======================================================



  if (!data) {

    throw new Error(

      'Không nhận được dữ liệu câu hỏi.'

    );

  }





  // =======================================================

  // KIỂM TRA COURSE

  // =======================================================



  if (!data.course_id) {

    throw new Error(

      'Thiếu mã học phần.'

    );

  }





  // =======================================================

  // KIỂM TRA NỘI DUNG CÂU HỎI

  // =======================================================



  if (

    !data.question_text ||

    !data.question_text.trim()

  ) {



    throw new Error(

      'Vui lòng nhập nội dung câu hỏi.'

    );



  }





  // =======================================================

  // KIỂM TRA 4 ĐÁP ÁN

  // =======================================================



  if (

    !data.option_a ||

    !data.option_b ||

    !data.option_c ||

    !data.option_d

  ) {



    throw new Error(

      'Vui lòng nhập đầy đủ 4 đáp án.'

    );



  }





  // =======================================================

  // KIỂM TRA ĐÁP ÁN ĐÚNG

  // =======================================================



  const validOptions = [

    'A',

    'B',

    'C',

    'D'

  ];





  const correctOption =

    String(data.correct_option)

      .toUpperCase()

      .trim();





  if (

    validOptions.indexOf(correctOption) === -1

  ) {



    throw new Error(

      'Đáp án đúng phải là A, B, C hoặc D.'

    );



  }





  // =======================================================

  // KIỂM TRA ĐIỂM

  // =======================================================



  const points =

    Number(data.points);





  if (

    isNaN(points) ||

    points <= 0

  ) {



    throw new Error(

      'Điểm phải lớn hơn 0.'

    );



  }





  // =======================================================

  // KIỂM TRA CHỦ ĐỀ

  // =======================================================



  if (!data.topic_id) {



    throw new Error(

      'Vui lòng chọn chủ đề.'

    );



  }





  // Lấy danh sách chủ đề của học phần

  const topics =

    getTopicsByCourse(

      data.course_id

    );





  // Tìm chủ đề được chọn

  const selectedTopic =

    topics.find(function(topic) {



      return (

        String(topic.topic_id) ===

        String(data.topic_id)

      );



    });





  // Không tìm thấy chủ đề

  if (!selectedTopic) {



    throw new Error(

      'Chủ đề không thuộc học phần đã chọn hoặc không tồn tại.'

    );



  }





  // Chỉ cho phép chủ đề đang hoạt động

  if (

    String(selectedTopic.status)

      .toUpperCase() !== 'ACTIVE'

  ) {



    throw new Error(

      'Chủ đề này hiện không còn hoạt động.'

    );



  }





  // =======================================================

  // KIỂM TRA MỨC ĐỘ

  // =======================================================



  const validDifficulties = [

    'Nhận biết',

    'Thông hiểu',

    'Vận dụng',

    'Vận dụng cao'

  ];





  const difficulty =

    String(data.difficulty || '')

      .trim();





  if (

    validDifficulties.indexOf(

      difficulty

    ) === -1

  ) {



    throw new Error(

      'Mức độ câu hỏi không hợp lệ.'

    );



  }





  // =======================================================

  // LẤY SHEET QUESTIONS

  // =======================================================



  const sheet =

    getSheet(

      CONFIG.SHEETS.QUESTIONS

    );





  // =======================================================

  // TẠO QUESTION ID

  // =======================================================



  const lastRow =

    sheet.getLastRow();





  let questionId =

    'Q001';





  if (lastRow >= 2) {



    const ids =

      sheet

        .getRange(

          2,

          1,

          lastRow - 1,

          1

        )

        .getValues();





    let maxNumber = 0;





    ids.forEach(function(row) {



      const id =

        String(row[0] || '');





      const match =

        id.match(/^Q(\d+)$/);





      if (match) {



        const number =

          Number(match[1]);





        if (number > maxNumber) {

          maxNumber = number;

        }



      }



    });





    questionId =

      'Q' +

      String(maxNumber + 1)

        .padStart(3, '0');



  }





  // =======================================================

  // GHI DỮ LIỆU VÀO QUESTIONS

  // =======================================================



  sheet.appendRow([



    // A - question_id

    questionId,



    // B - course_id

    data.course_id,



    // C - question_text

    data.question_text.trim(),



    // D - option_a

    data.option_a.trim(),



    // E - option_b

    data.option_b.trim(),



    // F - option_c

    data.option_c.trim(),



    // G - option_d

    data.option_d.trim(),



    // H - correct_option

    correctOption,



    // I - points

    points,



    // J - category

    '',



    // K - topic_id

    data.topic_id,



    // L - difficulty

    difficulty



  ]);





  // =======================================================

  // TRẢ KẾT QUẢ VỀ GIAO DIỆN

  // =======================================================



  return {



    success: true,



    question_id: questionId



  };



}



/\*\*

 \* =========================================================

 \* TẠO SHEET TOPICS

 \* =========================================================

 \*/



function createTopicsSheet() {



  const spreadsheet =

    SpreadsheetApp.openById(

      CONFIG.DATABASE_ID

    );





  let sheet =

    spreadsheet.getSheetByName(

      CONFIG.SHEETS.TOPICS

    );





  // Nếu Sheet đã tồn tại thì không tạo lại

  if (sheet) {



    Logger.log(

      'Sheet TOPICS đã tồn tại.'

    );



    return;



  }





  // Tạo Sheet mới

  sheet =

    spreadsheet.insertSheet(

      CONFIG.SHEETS.TOPICS

    );





  // Tiêu đề

  const headers = [



    'topic_id',

    'course_id',

    'topic_name',

    'display_order',

    'status'



  ];





  sheet

    .getRange(

      1,

      1,

      1,

      headers.length

    )

    .setValues([headers]);





  // Định dạng hàng tiêu đề

  sheet

    .getRange(

      1,

      1,

      1,

      headers.length

    )

    .setFontWeight('bold');





  // Cố định hàng đầu tiên

  sheet.setFrozenRows(1);





  // Điều chỉnh độ rộng

  sheet.autoResizeColumns(

    1,

    headers.length

  );





  Logger.log(

    'Đã tạo Sheet TOPICS thành công.'

  );



}



/\*\*

 \* =========================================================

 \* LẤY DANH SÁCH CHỦ ĐỀ THEO HỌC PHẦN

 \* =========================================================

 \*/



function getTopicsByCourse(courseId) {



  const sheet =

    getSheet(

      CONFIG.SHEETS.TOPICS

    );



  const lastRow =

    sheet.getLastRow();



  // Chưa có dữ liệu

  if (lastRow < 2) {

    return [];

  }



  const values =

    sheet

      .getRange(

        2,

        1,

        lastRow - 1,

        5

      )

      .getValues();



  const topics =

    values.map(function(row) {



      return {



        topic_id: row[0],



        course_id: row[1],



        topic_name: row[2],



        display_order: row[3],



        status: row[4]



      };



    });





  return topics



    .filter(function(topic) {



      return (

        String(topic.course_id) ===

        String(courseId)

      );



    })



    .filter(function(topic) {



      return (

        String(topic.status)

          .toUpperCase() !==

        'INACTIVE'

      );



    })



    .sort(function(a, b) {



      return (

        Number(a.display_order || 0) -

        Number(b.display_order || 0)

      );



    });



}



/\*\*

 \* =========================================================

 \* TẠO TOPIC ID

 \* =========================================================

 \*/



function generateTopicId() {



  const sheet =

    getSheet(

      CONFIG.SHEETS.TOPICS

    );



  const lastRow =

    sheet.getLastRow();





  if (lastRow < 2) {

    return 'TP001';

  }





  const ids =

    sheet

      .getRange(

        2,

        1,

        lastRow - 1,

        1

      )

      .getValues();





  let maxNumber = 0;





  ids.forEach(function(row) {



    const id =

      String(row[0] || '');



    const match =

      id.match(/^TP(\d+)$/);





    if (match) {



      const number =

        Number(match[1]);





      if (number > maxNumber) {

        maxNumber = number;

      }



    }



  });





  return (

    'TP' +

    String(maxNumber + 1)

      .padStart(3, '0')

  );



}



/\*\*

 \* =========================================================

 \* THÊM CHỦ ĐỀ

 \* =========================================================

 \*/



function addTopic(data) {



  if (!data) {

    throw new Error(

      'Không nhận được dữ liệu.'

    );

  }





  if (!data.course_id) {

    throw new Error(

      'Thiếu mã học phần.'

    );

  }





  const topicName =

    String(

      data.topic_name || ''

    ).trim();





  if (!topicName) {

    throw new Error(

      'Vui lòng nhập tên chủ đề.'

    );

  }





  const sheet =

    getSheet(

      CONFIG.SHEETS.TOPICS

    );





  // Kiểm tra trùng tên trong cùng học phần



  const existingTopics =

    getTopicsByCourse(

      data.course_id

    );





  const duplicated =

    existingTopics.some(

      function(topic) {



        return (

          String(

            topic.topic_name

          )

          .trim()

          .toLowerCase() ===

          topicName.toLowerCase()

        );



      }

    );





  if (duplicated) {



    throw new Error(

      'Chủ đề này đã tồn tại trong học phần.'

    );



  }





  // Tạo ID



  const topicId =

    generateTopicId();





  // Xác định thứ tự



  let displayOrder = 1;





  if (existingTopics.length > 0) {



    displayOrder =

      Math.max.apply(

        null,

        existingTopics.map(

          function(topic) {



            return Number(

              topic.display_order || 0

            );



          }

        )

      ) + 1;



  }





  // Ghi dữ liệu



  sheet.appendRow([



    topicId,



    data.course_id,



    topicName,



    displayOrder,



    'ACTIVE'



  ]);





  return {



    success: true,



    topic_id: topicId,



    topic_name: topicName



  };



}



/\*\*

 \* =========================================================

 \* SỬA CHỦ ĐỀ

 \* =========================================================

 \*/



function updateTopic(data) {



  if (!data || !data.topic_id) {



    throw new Error(

      'Thiếu mã chủ đề.'

    );



  }





  const topicName =

    String(

      data.topic_name || ''

    ).trim();





  if (!topicName) {



    throw new Error(

      'Vui lòng nhập tên chủ đề.'

    );



  }





  const sheet =

    getSheet(

      CONFIG.SHEETS.TOPICS

    );





  const lastRow =

    sheet.getLastRow();





  if (lastRow < 2) {



    throw new Error(

      'Không có dữ liệu chủ đề.'

    );



  }





  const values =

    sheet

      .getRange(

        2,

        1,

        lastRow - 1,

        5

      )

      .getValues();





  let foundRow = -1;





  values.forEach(

    function(row, index) {



      if (

        String(row[0]) ===

        String(data.topic_id)

      ) {



        foundRow =

          index + 2;



      }



    }

  );





  if (foundRow === -1) {



    throw new Error(

      'Không tìm thấy chủ đề.'

    );



  }





  // Kiểm tra trùng tên



  const courseId =

    sheet

      .getRange(

        foundRow,

        2

      )

      .getValue();





  const topics =

    getTopicsByCourse(

      courseId

    );





  const duplicated =

    topics.some(

      function(topic) {



        return (



          String(

            topic.topic_id

          ) !==

          String(data.topic_id)



          &&



          String(

            topic.topic_name

          )

          .trim()

          .toLowerCase() ===

          topicName.toLowerCase()



        );



      }

    );





  if (duplicated) {



    throw new Error(

      'Tên chủ đề đã tồn tại.'

    );



  }





  sheet

    .getRange(

      foundRow,

      3

    )

    .setValue(topicName);





  return {



    success: true



  };



}



/\*\*

 \* =========================================================

 \* XÓA CHỦ ĐỀ - XÓA MỀM

 \* =========================================================

 \*/



function deleteTopic(topicId) {



  if (!topicId) {



    throw new Error(

      'Thiếu mã chủ đề.'

    );



  }





  const sheet =

    getSheet(

      CONFIG.SHEETS.TOPICS

    );





  const lastRow =

    sheet.getLastRow();





  if (lastRow < 2) {



    throw new Error(

      'Không có dữ liệu.'

    );



  }





  const ids =

    sheet

      .getRange(

        2,

        1,

        lastRow - 1,

        1

      )

      .getValues();





  let foundRow = -1;





  ids.forEach(

    function(row, index) {



      if (

        String(row[0]) ===

        String(topicId)

      ) {



        foundRow =

          index + 2;



      }



    }

  );





  if (foundRow === -1) {



    throw new Error(

      'Không tìm thấy chủ đề.'

    );



  }





  sheet

    .getRange(

      foundRow,

      5

    )

    .setValue('INACTIVE');





  return {



    success: true



  };



}



/\*\*

 \* =========================================================

 \* KIỂM TRA CẤU TRÚC QUESTIONS

 \* =========================================================

 \*/



function inspectQuestionsSheet() {



  const sheet =

    getSheet(

      CONFIG.SHEETS.QUESTIONS

    );



  const lastColumn =

    sheet.getLastColumn();



  const headers =

    sheet

      .getRange(

        1,

        1,

        1,

        lastColumn

      )

      .getValues()[0];



  Logger.log(

    JSON.stringify(

      headers,

      null,

      2

    )

  );



}



/\*\*

 \* =========================================================

 \* NÂNG CẤP QUESTIONS

 \* Thêm topic_id và difficulty nếu chưa tồn tại

 \* Không xóa hoặc thay đổi dữ liệu hiện có

 \* =========================================================

 \*/



function upgradeQuestionsSheet() {



  const sheet =

    getSheet(

      CONFIG.SHEETS.QUESTIONS

    );



  const lastColumn =

    sheet.getLastColumn();



  const headers =

    sheet

      .getRange(

        1,

        1,

        1,

        lastColumn

      )

      .getValues()[0];





  // -------------------------------------------------------

  // Kiểm tra topic_id

  // -------------------------------------------------------



  if (

    headers.indexOf('topic_id') === -1

  ) {



    sheet

      .getRange(

        1,

        sheet.getLastColumn() + 1

      )

      .setValue('topic_id');



  }





  // -------------------------------------------------------

  // Kiểm tra difficulty

  // -------------------------------------------------------



  const updatedHeaders =

    sheet

      .getRange(

        1,

        1,

        1,

        sheet.getLastColumn()

      )

      .getValues()[0];





  if (

    updatedHeaders.indexOf('difficulty') === -1

  ) {



    sheet

      .getRange(

        1,

        sheet.getLastColumn() + 1

      )

      .setValue('difficulty');



  }





  // -------------------------------------------------------

  // Định dạng

  // -------------------------------------------------------



  sheet

    .getRange(

      1,

      1,

      1,

      sheet.getLastColumn()

    )

    .setFontWeight('bold');





  sheet.setFrozenRows(1);





  Logger.log(

    'Đã nâng cấp QUESTIONS thành công.'

  );





  Logger.log(

    JSON.stringify(

      sheet

        .getRange(

          1,

          1,

          1,

          sheet.getLastColumn()

        )

        .getValues()[0]

    )

  );



}



/\*\*

 \* =========================================================

 \* DANH SÁCH MỨC ĐỘ CÂU HỎI

 \* =========================================================

 \*/



function getQuestionDifficulties() {



  return [

    'Nhận biết',

    'Thông hiểu',

    'Vận dụng',

    'Vận dụng cao'

  ];



}



/\*\*

 \* =========================================================

 \* DỮ LIỆU CHO FORM THÊM CÂU HỎI

 \* =========================================================

 \*/



function getQuestionFormData(courseId) {



  if (!courseId) {



    throw new Error(

      'Thiếu mã học phần.'

    );



  }





  return {



    course_id: courseId,



    topics:

      getTopicsByCourse(

        courseId

      ),



    difficulties:

      getQuestionDifficulties()



  };



}



/\*\*

 \* =========================================================

 \* LẤY NGÂN HÀNG CÂU HỎI THEO HỌC PHẦN

 \* KÈM THÔNG TIN CHỦ ĐỀ

 \* =========================================================

 \*/



function getQuestionsGroupedByTopic(courseId) {



  if (!courseId) {



    throw new Error(

      'Thiếu mã học phần.'

    );



  }





  // =======================================================

  // LẤY QUESTIONS

  // =======================================================



  const questionSheet =

    getSheet(

      CONFIG.SHEETS.QUESTIONS

    );





  const questionLastRow =

    questionSheet.getLastRow();





  if (questionLastRow < 2) {



    return [];



  }





  const questionLastColumn =

    questionSheet.getLastColumn();





  // =======================================================

  // ĐỌC HEADER

  // =======================================================



  const headers =

    questionSheet

      .getRange(

        1,

        1,

        1,

        questionLastColumn

      )

      .getValues()[0];





  // =======================================================

  // XÁC ĐỊNH VỊ TRÍ CÁC CỘT

  // =======================================================



  const questionIdIndex =

    headers.indexOf(

      'question_id'

    );





  const courseIdIndex =

    headers.indexOf(

      'course_id'

    );





  const questionTextIndex =

    headers.indexOf(

      'question_text'

    );





  const optionAIndex =

    headers.indexOf(

      'option_a'

    );





  const optionBIndex =

    headers.indexOf(

      'option_b'

    );





  const optionCIndex =

    headers.indexOf(

      'option_c'

    );





  const optionDIndex =

    headers.indexOf(

      'option_d'

    );





  const correctOptionIndex =

    headers.indexOf(

      'correct_option'

    );





  const pointsIndex =

    headers.indexOf(

      'points'

    );





  const categoryIndex =

    headers.indexOf(

      'category'

    );





  const topicIdIndex =

    headers.indexOf(

      'topic_id'

    );





  const difficultyIndex =

    headers.indexOf(

      'difficulty'

    );





  const activeIndex =

    headers.indexOf(

      'is_active'

    );





  // =======================================================

  // KIỂM TRA CỘT BẮT BUỘC

  // =======================================================



  const requiredColumns = [



    {

      name: 'question_id',

      index: questionIdIndex

    },



    {

      name: 'course_id',

      index: courseIdIndex

    },



    {

      name: 'question_text',

      index: questionTextIndex

    },



    {

      name: 'option_a',

      index: optionAIndex

    },



    {

      name: 'option_b',

      index: optionBIndex

    },



    {

      name: 'option_c',

      index: optionCIndex

    },



    {

      name: 'option_d',

      index: optionDIndex

    },



    {

      name: 'correct_option',

      index: correctOptionIndex

    },



    {

      name: 'points',

      index: pointsIndex

    },



    {

      name: 'topic_id',

      index: topicIdIndex

    },



    {

      name: 'difficulty',

      index: difficultyIndex

    },



    {

      name: 'is_active',

      index: activeIndex

    }



  ];





  requiredColumns.forEach(

    function(column) {



      if (column.index === -1) {



        throw new Error(

          'Không tìm thấy cột ' +

          column.name +

          ' trong QUESTIONS.'

        );



      }



    }

  );





  // =======================================================

  // LẤY DỮ LIỆU QUESTIONS

  // =======================================================



  const questionData =

    questionSheet

      .getRange(

        2,

        1,

        questionLastRow - 1,

        questionLastColumn

      )

      .getValues();





  // =======================================================

  // LẤY TOPICS

  // =======================================================



  const topicSheet =

    getSheet(

      CONFIG.SHEETS.TOPICS

    );





  const topicLastRow =

    topicSheet.getLastRow();





  const topicMap = {};





  if (topicLastRow >= 2) {



    const topicLastColumn =

      topicSheet.getLastColumn();





    const topicData =

      topicSheet

        .getRange(

          2,

          1,

          topicLastRow - 1,

          topicLastColumn

        )

        .getValues();





    topicData.forEach(

      function(row) {



        const topicId =

          String(

            row[0] || ''

          )

          .trim();





        if (!topicId) {



          return;



        }





        topicMap[topicId] = {



          topic_id:

            topicId,



          course_id:

            String(

              row[1] || ''

            )

            .trim(),



          topic_name:

            String(

              row[2] || ''

            )

            .trim(),



          display_order:

            Number(

              row[3] || 0

            ),



          status:

            String(

              row[4] || ''

            )

            .trim()



        };



      }

    );



  }





  // =======================================================

  // LỌC CÂU HỎI

  // CHỈ LẤY:

  // 1. ĐÚNG HỌC PHẦN

  // 2. is_active = TRUE

  // =======================================================



  const questions = [];





  questionData.forEach(

    function(row) {



      const questionCourseId =

        String(

          row[courseIdIndex] || ''

        )

        .trim();





      // ---------------------------------------------------

      // KIỂM TRA HỌC PHẦN

      // ---------------------------------------------------



      if (

        questionCourseId !==

        String(courseId)

          .trim()

      ) {



        return;



      }





      // ---------------------------------------------------

      // KIỂM TRA TRẠNG THÁI

      // ---------------------------------------------------



      const isActive =

        String(

          row[activeIndex] || ''

        )

        .toUpperCase()

        .trim();





      if (isActive !== 'TRUE') {



        return;



      }





      // ---------------------------------------------------

      // LẤY CHỦ ĐỀ

      // ---------------------------------------------------



      const topicId =

        String(

          row[topicIdIndex] || ''

        )

        .trim();





      const topic =

        topicMap[topicId];





      // ---------------------------------------------------

      // THÊM CÂU HỎI

      // ---------------------------------------------------



      questions.push({



        question_id:

          String(

            row[questionIdIndex] || ''

          )

          .trim(),



        course_id:

          questionCourseId,



        question_text:

          String(

            row[questionTextIndex] || ''

          )

          .trim(),



        option_a:

          String(

            row[optionAIndex] || ''

          )

          .trim(),



        option_b:

          String(

            row[optionBIndex] || ''

          )

          .trim(),



        option_c:

          String(

            row[optionCIndex] || ''

          )

          .trim(),



        option_d:

          String(

            row[optionDIndex] || ''

          )

          .trim(),



        correct_option:

          String(

            row[correctOptionIndex] || ''

          )

          .trim(),



        points:

          Number(

            row[pointsIndex] || 0

          ),



        category:

          categoryIndex !== -1

            ? String(

                row[categoryIndex] || ''

              )

              .trim()

            : '',



        topic_id:

          topicId,



        topic_name:

          topic

            ? topic.topic_name

            : 'Chưa phân loại',



        topic_order:

          topic

            ? topic.display_order

            : 999999,



        difficulty:

          String(

            row[difficultyIndex] || ''

          )

          .trim(),



        is_active:

          true



      });



    }

  );





  // =======================================================

  // SẮP XẾP THEO CHỦ ĐỀ

  // =======================================================



  questions.sort(

    function(a, b) {



      if (

        a.topic_order !==

        b.topic_order

      ) {



        return (

          a.topic_order -

          b.topic_order

        );



      }





      return (

        a.question_id.localeCompare(

          b.question_id

        )

      );



    }

  );





  return questions;



}





function getQuestionById(questionId) {



  if (!questionId) {



    throw new Error(

      'Thiếu mã câu hỏi.'

    );



  }





  const sheet =

    getSheet(

      CONFIG.SHEETS.QUESTIONS

    );





  const lastRow =

    sheet.getLastRow();





  if (lastRow < 2) {



    throw new Error(

      'Ngân hàng câu hỏi đang trống.'

    );



  }





  const lastColumn =

    sheet.getLastColumn();





  const headers =

    sheet

      .getRange(

        1,

        1,

        1,

        lastColumn

      )

      .getValues()[0];





  const values =

    sheet

      .getRange(

        2,

        1,

        lastRow - 1,

        lastColumn

      )

      .getValues();





  const idIndex =

    headers.indexOf(

      'question_id'

    );





  if (idIndex === -1) {



    throw new Error(

      'Không tìm thấy cột question_id.'

    );



  }





  for (

    let i = 0;

    i < values.length;

    i++

  ) {



    if (

      String(

        values[i][idIndex]

      ) === String(questionId)

    ) {



      const question = {};





      headers.forEach(

        function(header, index) {



          question[header] =

            values[i][index];



        }

      );





      return question;



    }



  }





  throw new Error(

    'Không tìm thấy câu hỏi ' +

    questionId

  );



}



function updateQuestion(data) {



  if (!data) {



    throw new Error(

      'Không nhận được dữ liệu câu hỏi.'

    );



  }





  if (!data.question_id) {



    throw new Error(

      'Thiếu mã câu hỏi.'

    );



  }





  if (!data.course_id) {



    throw new Error(

      'Thiếu mã học phần.'

    );



  }





  if (

    !data.question_text ||

    !String(data.question_text).trim()

  ) {



    throw new Error(

      'Vui lòng nhập nội dung câu hỏi.'

    );



  }





  // =======================================================

  // KIỂM TRA 4 ĐÁP ÁN

  // =======================================================



  const options = [

    'option_a',

    'option_b',

    'option_c',

    'option_d'

  ];





  options.forEach(

    function(option) {



      if (

        !data[option] ||

        !String(data[option]).trim()

      ) {



        throw new Error(

          'Vui lòng nhập đầy đủ 4 đáp án.'

        );



      }



    }

  );





  // =======================================================

  // KIỂM TRA ĐÁP ÁN ĐÚNG

  // =======================================================



  const correctOption =

    String(

      data.correct_option || ''

    )

    .toUpperCase()

    .trim();





  if (

    ['A', 'B', 'C', 'D']

      .indexOf(correctOption) === -1

  ) {



    throw new Error(

      'Đáp án đúng phải là A, B, C hoặc D.'

    );



  }





  // =======================================================

  // KIỂM TRA ĐIỂM

  // =======================================================



  const points =

    Number(data.points);





  if (

    isNaN(points) ||

    points <= 0

  ) {



    throw new Error(

      'Điểm phải lớn hơn 0.'

    );



  }





  // =======================================================

  // LẤY SHEET

  // =======================================================



  const sheet =

    getSheet(

      CONFIG.SHEETS.QUESTIONS

    );





  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  if (lastRow < 2) {



    throw new Error(

      'Ngân hàng câu hỏi đang trống.'

    );



  }





  // =======================================================

  // ĐỌC HEADER

  // =======================================================



  const headers =

    sheet

      .getRange(

        1,

        1,

        1,

        lastColumn

      )

      .getValues()[0];





  const idIndex =

    headers.indexOf(

      'question_id'

    );





  if (idIndex === -1) {



    throw new Error(

      'Không tìm thấy cột question_id.'

    );



  }





  // =======================================================

  // TÌM DÒNG CÂU HỎI

  // =======================================================



  const values =

    sheet

      .getRange(

        2,

        1,

        lastRow - 1,

        lastColumn

      )

      .getValues();





  let targetRow = -1;





  for (

    let i = 0;

    i < values.length;

    i++

  ) {



    if (

      String(

        values[i][idIndex]

      ) === String(data.question_id)

    ) {



      targetRow =

        i + 2;



      break;



    }



  }





  if (targetRow === -1) {



    throw new Error(

      'Không tìm thấy câu hỏi ' +

      data.question_id

    );



  }





  // =======================================================

  // DỮ LIỆU CẦN CẬP NHẬT

  // =======================================================



  const updateData = {



    course_id:

      data.course_id,



    question_text:

      String(

        data.question_text

      ).trim(),



    option_a:

      String(

        data.option_a

      ).trim(),



    option_b:

      String(

        data.option_b

      ).trim(),



    option_c:

      String(

        data.option_c

      ).trim(),



    option_d:

      String(

        data.option_d

      ).trim(),



    correct_option:

      correctOption,



    points:

      points,



    category:

      data.category

        ? String(data.category).trim()

        : '',



    topic_id:

      data.topic_id

        ? String(data.topic_id).trim()

        : '',



    difficulty:

      data.difficulty

        ? String(data.difficulty).trim()

        : ''



  };





  // =======================================================

  // CẬP NHẬT THEO TÊN HEADER

  // =======================================================



  Object.keys(updateData)

    .forEach(

      function(field) {



        const columnIndex =

          headers.indexOf(field);





        if (columnIndex !== -1) {



          sheet

            .getRange(

              targetRow,

              columnIndex + 1

            )

            .setValue(

              updateData[field]

            );



        }



      }

    );





  return {



    success: true,



    question_id:

      data.question_id



  };



}



function deleteQuestion(questionId) {



  // =====================================================

  // KIỂM TRA QUESTION ID

  // =====================================================



  if (!questionId) {



    throw new Error(

      'Thiếu mã câu hỏi.'

    );



  }





  // =====================================================

  // LẤY SHEET QUESTIONS

  // =====================================================



  const sheet =

    getSheet(

      CONFIG.SHEETS.QUESTIONS

    );





  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  if (lastRow < 2) {



    throw new Error(

      'Ngân hàng câu hỏi đang trống.'

    );



  }





  // =====================================================

  // ĐỌC HEADER

  // =====================================================



  const headers =

    sheet

      .getRange(

        1,

        1,

        1,

        lastColumn

      )

      .getValues()[0];





  const idIndex =

    headers.indexOf(

      'question_id'

    );





  const activeIndex =

    headers.indexOf(

      'is_active'

    );





  const deletedAtIndex =

    headers.indexOf(

      'deleted_at'

    );





  // =====================================================

  // KIỂM TRA CỘT CẦN THIẾT

  // =====================================================



  if (idIndex === -1) {



    throw new Error(

      'Không tìm thấy cột question_id.'

    );



  }





  if (activeIndex === -1) {



    throw new Error(

      'Không tìm thấy cột is_active.'

    );



  }





  if (deletedAtIndex === -1) {



    throw new Error(

      'Không tìm thấy cột deleted_at.'

    );



  }





  // =====================================================

  // ĐỌC DỮ LIỆU

  // =====================================================



  const values =

    sheet

      .getRange(

        2,

        1,

        lastRow - 1,

        lastColumn

      )

      .getValues();





  let targetRow = -1;





  let currentActive =

    true;





  // =====================================================

  // TÌM CÂU HỎI

  // =====================================================



  for (

    let i = 0;

    i < values.length;

    i++

  ) {



    if (

      String(

        values[i][idIndex]

      ) === String(questionId)

    ) {



      targetRow =

        i + 2;





      currentActive =

        values[i][activeIndex];





      break;



    }



  }





  // =====================================================

  // KHÔNG TÌM THẤY

  // =====================================================



  if (targetRow === -1) {



    throw new Error(

      'Không tìm thấy câu hỏi ' +

      questionId

    );



  }





  // =====================================================

  // KIỂM TRA CÂU HỎI ĐÃ XÓA

  // =====================================================



  if (

    currentActive === false ||

    String(currentActive)

      .toUpperCase() === 'FALSE'

  ) {



    throw new Error(

      'Câu hỏi ' +

      questionId +

      ' đã được xóa trước đó.'

    );



  }





  // =====================================================

  // XÓA MỀM

  // =====================================================



  sheet

    .getRange(

      targetRow,

      activeIndex + 1

    )

    .setValue(false);





  sheet

    .getRange(

      targetRow,

      deletedAtIndex + 1

    )

    .setValue(

      new Date()

    );





  // =====================================================

  // KẾT QUẢ

  // =====================================================



  return {



    success: true,



    question_id:

      questionId,



    deleted_at:

      new Date()



  };



}



function getDeletedQuestionsByCourse(courseId) {



  if (!courseId) {



    throw new Error(

      'Thiếu mã học phần.'

    );



  }





  // =====================================================

  // LẤY SHEET QUESTIONS

  // =====================================================



  const questionSheet =

    getSheet(

      CONFIG.SHEETS.QUESTIONS

    );





  const questionLastRow =

    questionSheet.getLastRow();





  const questionLastColumn =

    questionSheet.getLastColumn();





  if (questionLastRow < 2) {



    return [];



  }





  // =====================================================

  // LẤY HEADER QUESTIONS

  // =====================================================



  const headers =

    questionSheet

      .getRange(

        1,

        1,

        1,

        questionLastColumn

      )

      .getValues()[0];





  const index = {



    question_id:

      headers.indexOf('question_id'),



    course_id:

      headers.indexOf('course_id'),



    question_text:

      headers.indexOf('question_text'),



    option_a:

      headers.indexOf('option_a'),



    option_b:

      headers.indexOf('option_b'),



    option_c:

      headers.indexOf('option_c'),



    option_d:

      headers.indexOf('option_d'),



    correct_option:

      headers.indexOf('correct_option'),



    points:

      headers.indexOf('points'),



    category:

      headers.indexOf('category'),



    topic_id:

      headers.indexOf('topic_id'),



    difficulty:

      headers.indexOf('difficulty'),



    is_active:

      headers.indexOf('is_active'),



    deleted_at:

      headers.indexOf('deleted_at')



  };





  // =====================================================

  // KIỂM TRA HEADER QUESTIONS

  // =====================================================



  if (

    index.question_id === -1 ||

    index.course_id === -1 ||

    index.is_active === -1

  ) {



    throw new Error(

      'QUESTIONS thiếu cột question_id, course_id hoặc is_active.'

    );



  }





  // =====================================================

  // LẤY SHEET TOPICS

  // =====================================================



  const topicSheet =

    getSheet(

      CONFIG.SHEETS.TOPICS

    );





  const topicLastRow =

    topicSheet.getLastRow();





  const topicMap = {};





  if (topicLastRow >= 2) {



    const topicLastColumn =

      topicSheet.getLastColumn();





    // ---------------------------------------------------

    // HEADER TOPICS

    // ---------------------------------------------------



    const topicHeaders =

      topicSheet

        .getRange(

          1,

          1,

          1,

          topicLastColumn

        )

        .getValues()[0];





    const topicIndex = {



      topic_id:

        topicHeaders.indexOf(

          'topic_id'

        ),



      course_id:

        topicHeaders.indexOf(

          'course_id'

        ),



      topic_name:

        topicHeaders.indexOf(

          'topic_name'

        ),



      display_order:

        topicHeaders.indexOf(

          'display_order'

        ),



      status:

        topicHeaders.indexOf(

          'status'

        )



    };





    // ---------------------------------------------------

    // KIỂM TRA HEADER TOPICS

    // ---------------------------------------------------



    if (

      topicIndex.topic_id === -1 ||

      topicIndex.topic_name === -1

    ) {



      throw new Error(

        'TOPICS thiếu cột topic_id hoặc topic_name.'

      );



    }





    // ---------------------------------------------------

    // LẤY DATA TOPICS

    // ---------------------------------------------------



    const topicData =

      topicSheet

        .getRange(

          2,

          1,

          topicLastRow - 1,

          topicLastColumn

        )

        .getValues();





    // ---------------------------------------------------

    // TẠO TOPIC MAP

    // ---------------------------------------------------



    topicData.forEach(

      function(row) {



        const topicId =

          String(

            row[topicIndex.topic_id] ?? ''

          )

          .trim();





        if (!topicId) {



          return;



        }





        const topicCourseId =

          topicIndex.course_id !== -1

            ? String(

                row[

                  topicIndex.course_id

                ] ?? ''

              )

              .trim()

            : '';





        const topicName =

          String(

            row[topicIndex.topic_name] ?? ''

          )

          .trim();



        console.log(

          'TOPIC:',

          topicId,

          '=>',

          topicName

        );



        topicMap[topicId] = {



          topic_id:

            topicId,



          course_id:

            topicCourseId,



          topic_name:

            topicName,



          display_order:

            topicIndex.display_order !== -1

              ? Number(

                  row[

                    topicIndex.display_order

                  ] ?? 0

                )

              : 0,



          status:

            topicIndex.status !== -1

              ? String(

                  row[

                    topicIndex.status

                  ] ?? ''

                )

                .trim()

              : ''



        };



      }

    );



  }





  // =====================================================

  // LẤY DATA QUESTIONS

  // =====================================================



  const questionData =

    questionSheet

      .getRange(

        2,

        1,

        questionLastRow - 1,

        questionLastColumn

      )

      .getValues();





  const deletedQuestions = [];





  // =====================================================

  // LỌC CÂU HỎI ĐÃ XÓA

  // =====================================================



  questionData.forEach(

    function(row) {





      // -------------------------------------------------

      // COURSE ID

      // -------------------------------------------------



      const rowCourseId =

        String(

          row[index.course_id] ?? ''

        )

        .trim();





      // -------------------------------------------------

      // CHỈ LẤY ĐÚNG COURSE

      // -------------------------------------------------



      if (

        rowCourseId !==

        String(courseId)

          .trim()

      ) {



        return;



      }





      // -------------------------------------------------

      // ĐỌC IS_ACTIVE

      // -------------------------------------------------



      const activeValue =

        row[index.is_active];





      const isActive =

        activeValue === true ||

        String(activeValue)

          .toUpperCase()

          .trim() === 'TRUE';





      // -------------------------------------------------

      // CHỈ LẤY CÂU ĐÃ XÓA

      // -------------------------------------------------



      if (isActive) {



        return;



      }





      // -------------------------------------------------

      // TOPIC ID

      // -------------------------------------------------



      const topicId =

        index.topic_id !== -1

          ? String(

              row[index.topic_id] ?? ''

            )

            .trim()

          : '';





      // -------------------------------------------------

      // TÌM TOPIC

      // -------------------------------------------------



      const topic =

        topicId

          ? topicMap[topicId]

          : null;





      // -------------------------------------------------

      // TOPIC NAME

      // -------------------------------------------------



      const topicName =

        topic

          ? topic.topic_name

          : 'Chưa phân loại';





      // -------------------------------------------------

      // DELETED AT

      // -------------------------------------------------



      let deletedAt = '';





      if (

        index.deleted_at !== -1 &&

        row[index.deleted_at]

      ) {



        try {



          deletedAt =

            Utilities.formatDate(

              new Date(

                row[index.deleted_at]

              ),

              Session.getScriptTimeZone(),

              'dd/MM/yyyy HH:mm:ss'

            );



        } catch (error) {



          deletedAt =

            String(

              row[index.deleted_at]

            );



        }



      }





      // -------------------------------------------------

      // THÊM CÂU HỎI VÀO DANH SÁCH

      // -------------------------------------------------



      deletedQuestions.push({



        question_id:

          String(

            row[index.question_id] ?? ''

          )

          .trim(),



        course_id:

          rowCourseId,



        question_text:

          String(

            row[index.question_text] ?? ''

          )

          .trim(),



        option_a:

          String(

            row[index.option_a] ?? ''

          )

          .trim(),



        option_b:

          String(

            row[index.option_b] ?? ''

          )

          .trim(),



        option_c:

          String(

            row[index.option_c] ?? ''

          )

          .trim(),



        option_d:

          String(

            row[index.option_d] ?? ''

          )

          .trim(),



        correct_option:

          String(

            row[index.correct_option] ?? ''

          )

          .trim(),



        points:

          Number(

            row[index.points] ?? 0

          ),



        category:

          index.category !== -1

            ? String(

                row[index.category] ?? ''

              )

              .trim()

            : '',



        topic_id:

          topicId,



        topic_name:

          topicName,



        difficulty:

          index.difficulty !== -1

            ? String(

                row[index.difficulty] ?? ''

              )

              .trim()

            : '',



        is_active:

          false,



        deleted_at:

          deletedAt



      });



    }

  );





  // =====================================================

  // SẮP XẾP

  // =====================================================



  deletedQuestions.sort(

    function(a, b) {



      const topicA =

        topicMap[a.topic_id]

          ? topicMap[a.topic_id]

              .display_order

          : 999999;





      const topicB =

        topicMap[b.topic_id]

          ? topicMap[b.topic_id]

              .display_order

          : 999999;





      if (

        topicA !==

        topicB

      ) {



        return (

          topicA -

          topicB

        );



      }





      return (

        a.question_id.localeCompare(

          b.question_id

        )

      );



    }

  );





  // =====================================================

  // TRẢ KẾT QUẢ

  // =====================================================



  return deletedQuestions;



}



function restoreQuestion(questionId) {



  // =====================================================

  // KIỂM TRA QUESTION ID

  // =====================================================



  if (!questionId) {



    throw new Error(

      'Thiếu mã câu hỏi.'

    );



  }





  questionId =

    String(questionId)

      .trim();





  // =====================================================

  // LẤY SHEET QUESTIONS

  // =====================================================



  const sheet =

    getSheet(

      CONFIG.SHEETS.QUESTIONS

    );





  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  if (lastRow < 2) {



    throw new Error(

      'QUESTIONS chưa có dữ liệu.'

    );



  }





  // =====================================================

  // LẤY HEADER

  // =====================================================



  const headers =

    sheet

      .getRange(

        1,

        1,

        1,

        lastColumn

      )

      .getValues()[0];





  const questionIdIndex =

    headers.indexOf(

      'question_id'

    );





  const isActiveIndex =

    headers.indexOf(

      'is_active'

    );





  const deletedAtIndex =

    headers.indexOf(

      'deleted_at'

    );





  // =====================================================

  // KIỂM TRA HEADER

  // =====================================================



  if (

    questionIdIndex === -1 ||

    isActiveIndex === -1

  ) {



    throw new Error(

      'QUESTIONS thiếu cột question_id hoặc is_active.'

    );



  }





  // =====================================================

  // LẤY DATA

  // =====================================================



  const data =

    sheet

      .getRange(

        2,

        1,

        lastRow - 1,

        lastColumn

      )

      .getValues();





  // =====================================================

  // TÌM CÂU HỎI

  // =====================================================



  let foundRow =

    -1;





  let foundData =

    null;





  data.some(

    function(row, index) {



      const currentQuestionId =

        String(

          row[questionIdIndex] ?? ''

        )

        .trim();





      if (

        currentQuestionId !==

        questionId

      ) {



        return false;



      }





      foundRow =

        index + 2;





      foundData =

        row;





      return true;



    }

  );





  // =====================================================

  // KHÔNG TÌM THẤY

  // =====================================================



  if (foundRow === -1) {



    throw new Error(

      'Không tìm thấy câu hỏi: ' +

      questionId

    );



  }





  // =====================================================

  // KIỂM TRA TRẠNG THÁI HIỆN TẠI

  // =====================================================



  const activeValue =

    foundData[isActiveIndex];





  const isActive =

    activeValue === true ||

    String(activeValue)

      .toUpperCase()

      .trim() === 'TRUE';





  // =====================================================

  // NẾU ĐÃ ACTIVE

  // =====================================================



  if (isActive) {



    throw new Error(

      'Câu hỏi ' +

      questionId +

      ' đang hoạt động, không cần khôi phục.'

    );



  }





  // =====================================================

  // KHÔI PHỤC IS_ACTIVE

  // =====================================================



  sheet

    .getRange(

      foundRow,

      isActiveIndex + 1

    )

    .setValue(true);





  // =====================================================

  // XÓA DELETED_AT

  // =====================================================



  if (

    deletedAtIndex !== -1

  ) {



    sheet

      .getRange(

        foundRow,

        deletedAtIndex + 1

      )

      .clearContent();



  }





  // =====================================================

  // TRẢ KẾT QUẢ

  // =====================================================



  return {



    success: true,



    question_id:

      questionId,



    message:

      'Đã khôi phục câu hỏi ' +

      questionId



  };



}


