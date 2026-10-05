function createExam(data) {

  // =====================================================
  // KIỂM TRA DỮ LIỆU
  // =====================================================

  if (!data) {
    throw new Error(
      'Không nhận được dữ liệu đề thi.'
    );
  }


  if (!data.course_id) {
    throw new Error(
      'Thiếu mã học phần.'
    );
  }


  if (
    !data.exam_name ||
    !String(data.exam_name).trim()
  ) {

    throw new Error(
      'Vui lòng nhập tên đề thi.'
    );

  }


  // =====================================================
  // THỜI GIAN LÀM BÀI
  // =====================================================

  const durationMinutes =
    Number(data.duration_minutes);


  if (
    isNaN(durationMinutes) ||
    durationMinutes <= 0
  ) {

    throw new Error(
      'Thời gian làm bài phải lớn hơn 0 phút.'
    );

  }


  // =====================================================
  // LẤY SHEET EXAMS
  // =====================================================

  const sheet =
    getSheet(
      CONFIG.SHEETS.EXAMS
    );


  const lastRow =
    sheet.getLastRow();


  // =====================================================
  // TẠO EXAM ID
  // =====================================================

  let examId =
    'EX001';


  if (lastRow >= 2) {

    const examIdIndex =
      0;


    const ids =
      sheet
        .getRange(
          2,
          examIdIndex + 1,
          lastRow - 1,
          1
        )
        .getValues();


    let maxNumber = 0;


    ids.forEach(
      function(row) {

        const id =
          String(row[0] || '')
            .trim();


        const match =
          id.match(/^EX(\d+)$/);


        if (match) {

          const number =
            Number(match[1]);


          if (
            number > maxNumber
          ) {

            maxNumber =
              number;

          }

        }

      }
    );


    examId =
      'EX' +
      String(maxNumber + 1)
        .padStart(3, '0');

  }


  // =====================================================
  // THỜI GIAN
  // =====================================================

  const now =
    new Date();


  // =====================================================
  // GIÁ TRỊ MẶC ĐỊNH
  // =====================================================

  const shuffleQuestions =
    data.shuffle_questions === true ||
    String(
      data.shuffle_questions
    ).toUpperCase() === 'TRUE';


  const shuffleOptions =
    data.shuffle_options === true ||
    String(
      data.shuffle_options
    ).toUpperCase() === 'TRUE';


  const showResult =
    data.show_result === true ||
    String(
      data.show_result
    ).toUpperCase() === 'TRUE';


  // =====================================================
  // TẠO ĐỀ THI
  // =====================================================

  sheet.appendRow([

    examId,

    String(data.course_id)
      .trim(),

    String(data.exam_name)
      .trim(),

    durationMinutes,

    0,

    0,

    shuffleQuestions,

    shuffleOptions,

    showResult,

    'DRAFT',

    now,

    now

  ]);


  // =====================================================
  // TRẢ KẾT QUẢ
  // =====================================================

  return {

    success: true,

    exam_id:
      examId,

    course_id:
      String(data.course_id)
        .trim(),

    exam_name:
      String(data.exam_name)
        .trim(),

    duration_minutes:
      durationMinutes,

    status:
      'DRAFT'

  };

}

function testCreateExam() {

  const data = {

    course_id:
      'HP001',

    exam_name:
      'Kiểm tra giữa kỳ Sinh thái học',

    duration_minutes:
      45,

    shuffle_questions:
      true,

    shuffle_options:
      true,

    show_result:
      true

  };


  const result =
    createExam(data);


  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}

function addQuestionToExam(data) {

  // =====================================================
  // KIỂM TRA DỮ LIỆU
  // =====================================================

  if (!data) {
    throw new Error(
      'Không nhận được dữ liệu.'
    );
  }


  if (!data.exam_id) {
    throw new Error(
      'Thiếu mã đề thi.'
    );
  }


  if (!data.question_id) {
    throw new Error(
      'Thiếu mã câu hỏi.'
    );
  }


  const examId =
    String(data.exam_id)
      .trim();


  const questionId =
    String(data.question_id)
      .trim();


  // =====================================================
  // KIỂM TRA ĐỀ THI
  // =====================================================

  const examsSheet =
    getSheet(
      CONFIG.SHEETS.EXAMS
    );


  const examLastRow =
    examsSheet.getLastRow();


  if (examLastRow < 2) {

    throw new Error(
      'Chưa có đề thi.'
    );

  }


  const examData =
    examsSheet
      .getRange(
        2,
        1,
        examLastRow - 1,
        examsSheet.getLastColumn()
      )
      .getValues();


  let examRow =
    -1;


  let examInfo =
    null;


  examData.some(
    function(row, index) {

      if (
        String(row[0] || '').trim() ===
        examId
      ) {

        examRow =
          index + 2;

        examInfo =
          row;

        return true;

      }

      return false;

    }
  );


  if (examRow === -1) {

    throw new Error(
      'Không tìm thấy đề thi: ' +
      examId
    );

  }


  // =====================================================
  // KHÔNG CHO THÊM VÀO ĐỀ ĐÃ ĐÓNG
  // =====================================================

  const examStatus =
    String(
      examInfo[9] || ''
    )
    .trim()
    .toUpperCase();


  if (
    examStatus === 'CLOSED'
  ) {

    throw new Error(
      'Không thể thêm câu hỏi vào đề đã đóng.'
    );

  }


  // =====================================================
  // KIỂM TRA CÂU HỎI
  // =====================================================

  const questionsSheet =
    getSheet(
      CONFIG.SHEETS.QUESTIONS
    );


  const questionLastRow =
    questionsSheet.getLastRow();


  if (questionLastRow < 2) {

    throw new Error(
      'Chưa có câu hỏi.'
    );

  }


  const questionData =
    questionsSheet
      .getRange(
        2,
        1,
        questionLastRow - 1,
        questionsSheet.getLastColumn()
      )
      .getValues();


  let questionInfo =
    null;


  questionData.some(
    function(row) {

      if (
        String(row[0] || '').trim() ===
        questionId
      ) {

        questionInfo =
          row;

        return true;

      }

      return false;

    }
  );


  if (!questionInfo) {

    throw new Error(
      'Không tìm thấy câu hỏi: ' +
      questionId
    );

  }


  // =====================================================
  // KIỂM TRA CÂU HỎI CÒN HOẠT ĐỘNG
  // =====================================================

  const questionHeaders =
    questionsSheet
      .getRange(
        1,
        1,
        1,
        questionsSheet.getLastColumn()
      )
      .getValues()[0];


  const questionActiveIndex =
    questionHeaders.indexOf(
      'is_active'
    );


  if (
    questionActiveIndex !== -1
  ) {

    const activeValue =
      questionInfo[
        questionActiveIndex
      ];


    const isActive =
      activeValue === true ||
      String(activeValue)
        .toUpperCase()
        .trim() === 'TRUE';


    if (!isActive) {

      throw new Error(
        'Không thể thêm câu hỏi đã bị xóa.'
      );

    }

  }


  // =====================================================
  // KIỂM TRA CÂU HỎI THUỘC ĐÚNG HỌC PHẦN
  // =====================================================

  const questionCourseId =
    String(
      questionInfo[1] || ''
    )
    .trim();


  const examCourseId =
    String(
      examInfo[1] || ''
    )
    .trim();


  if (
    questionCourseId !==
    examCourseId
  ) {

    throw new Error(
      'Câu hỏi không thuộc học phần của đề thi.'
    );

  }


  // =====================================================
  // LẤY SHEET EXAM_QUESTIONS
  // =====================================================

  const sheet =
    getSheet(
      CONFIG.SHEETS.EXAM_QUESTIONS
    );


  const lastRow =
    sheet.getLastRow();


  // =====================================================
  // KIỂM TRA CÂU HỎI ĐÃ CÓ TRONG ĐỀ CHƯA
  // =====================================================

  let nextOrder =
    1;


  if (lastRow >= 2) {

    const existingData =
      sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          sheet.getLastColumn()
        )
        .getValues();


    let maxOrder =
      0;


    for (
      let i = 0;
      i < existingData.length;
      i++
    ) {

      const row =
        existingData[i];


      const existingExamId =
        String(
          row[1] || ''
        ).trim();


      const existingQuestionId =
        String(
          row[2] || ''
        ).trim();


      if (
        existingExamId === examId
      ) {

        const order =
          Number(
            row[3] || 0
          );


        if (
          order > maxOrder
        ) {

          maxOrder =
            order;

        }


        if (
          existingQuestionId ===
          questionId
        ) {

          throw new Error(
            'Câu hỏi ' +
            questionId +
            ' đã có trong đề.'
          );

        }

      }

    }


    nextOrder =
      maxOrder + 1;

  }


  // =====================================================
  // TẠO EXAM QUESTION ID
  // =====================================================

  let examQuestionId =
    'EQ001';


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


    let maxNumber =
      0;


    ids.forEach(
      function(row) {

        const id =
          String(row[0] || '')
            .trim();


        const match =
          id.match(/^EQ(\d+)$/);


        if (match) {

          const number =
            Number(match[1]);


          if (
            number > maxNumber
          ) {

            maxNumber =
              number;

          }

        }

      }
    );


    examQuestionId =
      'EQ' +
      String(
        maxNumber + 1
      )
      .padStart(
        3,
        '0'
      );

  }


  // =====================================================
  // ĐIỂM
  // =====================================================

  const points =
    Number(
      data.points !== undefined
        ? data.points
        : questionInfo[8]
    );


  if (
    isNaN(points) ||
    points <= 0
  ) {

    throw new Error(
      'Điểm của câu hỏi phải lớn hơn 0.'
    );

  }


  // =====================================================
  // THÊM VÀO EXAM_QUESTIONS
  // =====================================================

  sheet.appendRow([

    examQuestionId,

    examId,

    questionId,

    nextOrder,

    points,

    true,

    new Date()

  ]);


  // =====================================================
  // CẬP NHẬT EXAMS
  // =====================================================

  updateExamTotals(
    examId
  );


  // =====================================================
  // TRẢ KẾT QUẢ
  // =====================================================

  return {

    success: true,

    exam_question_id:
      examQuestionId,

    exam_id:
      examId,

    question_id:
      questionId,

    question_order:
      nextOrder,

    points:
      points

  };

}

function getExamEditorData(examId) {

  if (!examId) {

    throw new Error(
      'Thiếu mã đề thi.'
    );

  }


  examId =
    String(examId)
      .trim();


  // =====================================================
  // LẤY SHEET EXAMS
  // =====================================================

  const examSheet =
    getSheet(
      CONFIG.SHEETS.EXAMS
    );


  const examLastRow =
    examSheet.getLastRow();


  const examLastColumn =
    examSheet.getLastColumn();


  if (examLastRow < 2) {

    throw new Error(
      'Chưa có đề thi.'
    );

  }


  // =====================================================
  // HEADER EXAMS
  // =====================================================

  const headers =
    examSheet
      .getRange(
        1,
        1,
        1,
        examLastColumn
      )
      .getValues()[0];


  const index = {

    exam_id:
      headers.indexOf('exam_id'),

    course_id:
      headers.indexOf('course_id'),

    exam_name:
      headers.indexOf('exam_name'),

    duration_minutes:
      headers.indexOf('duration_minutes'),

    total_questions:
      headers.indexOf('total_questions'),

    total_points:
      headers.indexOf('total_points'),

    shuffle_questions:
      headers.indexOf('shuffle_questions'),

    shuffle_options:
      headers.indexOf('shuffle_options'),

    show_result:
      headers.indexOf('show_result'),

    status:
      headers.indexOf('status'),

    created_at:
      headers.indexOf('created_at'),

    updated_at:
      headers.indexOf('updated_at')

  };


  if (
    index.exam_id === -1 ||
    index.course_id === -1 ||
    index.exam_name === -1
  ) {

    throw new Error(
      'EXAMS thiếu các cột bắt buộc.'
    );

  }


  // =====================================================
  // TÌM ĐỀ THI
  // =====================================================

  const examData =
    examSheet
      .getRange(
        2,
        1,
        examLastRow - 1,
        examLastColumn
      )
      .getValues();


  let exam = null;


  examData.some(
    function(row) {

      const rowExamId =
        String(
          row[index.exam_id] || ''
        ).trim();


      if (
        rowExamId !== examId
      ) {

        return false;

      }


      exam = {

        exam_id:
          rowExamId,

        course_id:
          String(
            row[index.course_id] || ''
          ).trim(),

        exam_name:
          String(
            row[index.exam_name] || ''
          ).trim(),

        duration_minutes:
          index.duration_minutes !== -1
            ? Number(
                row[index.duration_minutes] || 0
              )
            : 0,

        total_questions:
          index.total_questions !== -1
            ? Number(
                row[index.total_questions] || 0
              )
            : 0,

        total_points:
          index.total_points !== -1
            ? Number(
                row[index.total_points] || 0
              )
            : 0,

        shuffle_questions:
          index.shuffle_questions !== -1
            ? row[index.shuffle_questions]
            : true,

        shuffle_options:
          index.shuffle_options !== -1
            ? row[index.shuffle_options]
            : true,

        show_result:
          index.show_result !== -1
            ? row[index.show_result]
            : true,

        status:
          index.status !== -1
            ? String(
                row[index.status] || ''
              ).trim()
            : 'DRAFT',

        created_at:
          index.created_at !== -1
            ? row[index.created_at]
            : '',

        updated_at:
          index.updated_at !== -1
            ? row[index.updated_at]
            : ''

      };


      return true;

    }
  );


  if (!exam) {

    throw new Error(
      'Không tìm thấy đề thi: ' +
      examId
    );

  }


  // =====================================================
  // LẤY CÂU HỎI TRONG ĐỀ
  // =====================================================

  const questions =
    getQuestionsByExam(
      examId
    );


  // =====================================================
  // TRẢ DỮ LIỆU CHO FRONTEND
  // =====================================================

  return {

    success: true,

    exam:
      exam,

    questions:
      questions || []

  };

}

function updateExamTotals(examId) {

  const examQuestionsSheet =
    getSheet(
      CONFIG.SHEETS.EXAM_QUESTIONS
    );


  const examsSheet =
    getSheet(
      CONFIG.SHEETS.EXAMS
    );


  // =====================================================
  // LẤY EXAM_QUESTIONS
  // =====================================================

  const lastRow =
    examQuestionsSheet.getLastRow();


  let totalQuestions =
    0;


  let totalPoints =
    0;


  if (lastRow >= 2) {

    const data =
      examQuestionsSheet
        .getRange(
          2,
          1,
          lastRow - 1,
          examQuestionsSheet.getLastColumn()
        )
        .getValues();


    data.forEach(
      function(row) {

        const rowExamId =
          String(
            row[1] || ''
          ).trim();


        const activeValue =
          row[5];


        const isActive =
          activeValue === true ||
          String(activeValue)
            .toUpperCase()
            .trim() === 'TRUE';


        if (
          rowExamId === examId &&
          isActive
        ) {

          totalQuestions++;


          totalPoints +=
            Number(
              row[4] || 0
            );

        }

      }
    );

  }


  // =====================================================
  // TÌM ĐỀ
  // =====================================================

  const examLastRow =
    examsSheet.getLastRow();


  if (
    examLastRow < 2
  ) {

    throw new Error(
      'Không tìm thấy dữ liệu EXAMS.'
    );

  }


  const examData =
    examsSheet
      .getRange(
        2,
        1,
        examLastRow - 1,
        examsSheet.getLastColumn()
      )
      .getValues();


  let targetRow =
    -1;


  examData.some(
    function(row, index) {

      if (
        String(row[0] || '').trim() ===
        String(examId).trim()
      ) {

        targetRow =
          index + 2;

        return true;

      }

      return false;

    }
  );


  if (
    targetRow === -1
  ) {

    throw new Error(
      'Không tìm thấy đề thi: ' +
      examId
    );

  }


  // =====================================================
  // CẬP NHẬT EXAMS
  // =====================================================

  // Cột E = total_questions
  examsSheet
    .getRange(
      targetRow,
      5
    )
    .setValue(
      totalQuestions
    );


  // Cột F = total_points
  examsSheet
    .getRange(
      targetRow,
      6
    )
    .setValue(
      totalPoints
    );


  // Cột L = updated_at
  examsSheet
    .getRange(
      targetRow,
      12
    )
    .setValue(
      new Date()
    );


  return {

    total_questions:
      totalQuestions,

    total_points:
      totalPoints

  };

}

function testAddQuestionToExam() {

  const result =
    addQuestionToExam({

      exam_id:
        'EX001',

      question_id:
        'Q002'

    });


  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}

function getExamData(examId) {

  // =====================================================
  // KIỂM TRA
  // =====================================================

  if (!examId) {

    throw new Error(
      'Thiếu mã đề thi.'
    );

  }


  examId =
    String(examId)
      .trim();


  // =====================================================
  // LẤY SHEET EXAMS
  // =====================================================

  const examsSheet =
    getSheet(
      CONFIG.SHEETS.EXAMS
    );


  const examLastRow =
    examsSheet.getLastRow();


  const examLastColumn =
    examsSheet.getLastColumn();


  if (examLastRow < 2) {

    throw new Error(
      'Chưa có dữ liệu đề thi.'
    );

  }


  // =====================================================
  // ĐỌC HEADER EXAMS
  // =====================================================

  const examHeaders =
    examsSheet
      .getRange(
        1,
        1,
        1,
        examLastColumn
      )
      .getValues()[0];


  const examIndex = {

    exam_id:
      examHeaders.indexOf(
        'exam_id'
      ),

    course_id:
      examHeaders.indexOf(
        'course_id'
      ),

    exam_name:
      examHeaders.indexOf(
        'exam_name'
      ),

    duration_minutes:
      examHeaders.indexOf(
        'duration_minutes'
      ),

    total_questions:
      examHeaders.indexOf(
        'total_questions'
      ),

    total_points:
      examHeaders.indexOf(
        'total_points'
      ),

    shuffle_questions:
      examHeaders.indexOf(
        'shuffle_questions'
      ),

    shuffle_options:
      examHeaders.indexOf(
        'shuffle_options'
      ),

    show_result:
      examHeaders.indexOf(
        'show_result'
      ),

    status:
      examHeaders.indexOf(
        'status'
      ),

    created_at:
      examHeaders.indexOf(
        'created_at'
      ),

    updated_at:
      examHeaders.indexOf(
        'updated_at'
      )

  };


  // =====================================================
  // KIỂM TRA HEADER
  // =====================================================

  if (
    examIndex.exam_id === -1 ||
    examIndex.course_id === -1 ||
    examIndex.exam_name === -1
  ) {

    throw new Error(
      'EXAMS thiếu các cột bắt buộc.'
    );

  }


  // =====================================================
  // TÌM ĐỀ THI
  // =====================================================

  const examData =
    examsSheet
      .getRange(
        2,
        1,
        examLastRow - 1,
        examLastColumn
      )
      .getValues();


  let examRow =
    null;


  examData.some(
    function(row) {

      const rowExamId =
        String(
          row[examIndex.exam_id] || ''
        )
        .trim();


      if (
        rowExamId === examId
      ) {

        examRow =
          row;

        return true;

      }


      return false;

    }
  );


  if (!examRow) {

    throw new Error(
      'Không tìm thấy đề thi: ' +
      examId
    );

  }


  // =====================================================
  // CHUYỂN BOOLEAN
  // =====================================================

  function toBoolean(value) {

    return (
      value === true ||
      String(value)
        .toUpperCase()
        .trim() === 'TRUE'
    );

  }


  // =====================================================
  // TẠO OBJECT EXAM
  // =====================================================

  const exam = {

    exam_id:
      String(
        examRow[examIndex.exam_id] || ''
      ).trim(),

    course_id:
      String(
        examRow[examIndex.course_id] || ''
      ).trim(),

    exam_name:
      String(
        examRow[examIndex.exam_name] || ''
      ).trim(),

    duration_minutes:
      Number(
        examRow[
          examIndex.duration_minutes
        ] || 0
      ),

    total_questions:
      Number(
        examRow[
          examIndex.total_questions
        ] || 0
      ),

    total_points:
      Number(
        examRow[
          examIndex.total_points
        ] || 0
      ),

    shuffle_questions:
      examIndex.shuffle_questions !== -1
        ? toBoolean(
            examRow[
              examIndex.shuffle_questions
            ]
          )
        : false,

    shuffle_options:
      examIndex.shuffle_options !== -1
        ? toBoolean(
            examRow[
              examIndex.shuffle_options
            ]
          )
        : false,

    show_result:
      examIndex.show_result !== -1
        ? toBoolean(
            examRow[
              examIndex.show_result
            ]
          )
        : false,

    status:
      examIndex.status !== -1
        ? String(
            examRow[
              examIndex.status
            ] || ''
          ).trim()
        : '',

    created_at:
      examIndex.created_at !== -1
        ? examRow[
            examIndex.created_at
          ]
        : '',

    updated_at:
      examIndex.updated_at !== -1
        ? examRow[
            examIndex.updated_at
          ]
        : ''

  };


  // =====================================================
  // LẤY EXAM_QUESTIONS
  // =====================================================

  const examQuestionsSheet =
    getSheet(
      CONFIG.SHEETS.EXAM_QUESTIONS
    );


  const eqLastRow =
    examQuestionsSheet.getLastRow();


  const eqLastColumn =
    examQuestionsSheet.getLastColumn();


  if (eqLastRow < 2) {

    return {

      exam:
        exam,

      questions:
        [],

      total:
        0

    };

  }


  // =====================================================
  // ĐỌC HEADER EXAM_QUESTIONS
  // =====================================================

  const eqHeaders =
    examQuestionsSheet
      .getRange(
        1,
        1,
        1,
        eqLastColumn
      )
      .getValues()[0];


  const eqIndex = {

    exam_question_id:
      eqHeaders.indexOf(
        'exam_question_id'
      ),

    exam_id:
      eqHeaders.indexOf(
        'exam_id'
      ),

    question_id:
      eqHeaders.indexOf(
        'question_id'
      ),

    question_order:
      eqHeaders.indexOf(
        'question_order'
      ),

    points:
      eqHeaders.indexOf(
        'points'
      ),

    is_active:
      eqHeaders.indexOf(
        'is_active'
      )

  };


  if (
    eqIndex.exam_id === -1 ||
    eqIndex.question_id === -1
  ) {

    throw new Error(
      'EXAM_QUESTIONS thiếu cột exam_id hoặc question_id.'
    );

  }


  const eqData =
    examQuestionsSheet
      .getRange(
        2,
        1,
        eqLastRow - 1,
        eqLastColumn
      )
      .getValues();


  // =====================================================
  // LẤY QUESTIONS
  // =====================================================

  const questionsSheet =
    getSheet(
      CONFIG.SHEETS.QUESTIONS
    );


  const questionLastRow =
    questionsSheet.getLastRow();


  const questionLastColumn =
    questionsSheet.getLastColumn();


  const questionMap =
    {};


  if (
    questionLastRow >= 2
  ) {

    const questionHeaders =
      questionsSheet
        .getRange(
          1,
          1,
          1,
          questionLastColumn
        )
        .getValues()[0];


    const questionIndex = {

      question_id:
        questionHeaders.indexOf(
          'question_id'
        ),

      course_id:
        questionHeaders.indexOf(
          'course_id'
        ),

      question_text:
        questionHeaders.indexOf(
          'question_text'
        ),

      option_a:
        questionHeaders.indexOf(
          'option_a'
        ),

      option_b:
        questionHeaders.indexOf(
          'option_b'
        ),

      option_c:
        questionHeaders.indexOf(
          'option_c'
        ),

      option_d:
        questionHeaders.indexOf(
          'option_d'
        ),

      correct_option:
        questionHeaders.indexOf(
          'correct_option'
        ),

      points:
        questionHeaders.indexOf(
          'points'
        ),

      category:
        questionHeaders.indexOf(
          'category'
        ),

      topic_id:
        questionHeaders.indexOf(
          'topic_id'
        ),

      difficulty:
        questionHeaders.indexOf(
          'difficulty'
        ),

      is_active:
        questionHeaders.indexOf(
          'is_active'
        )

    };


    const questionData =
      questionsSheet
        .getRange(
          2,
          1,
          questionLastRow - 1,
          questionLastColumn
        )
        .getValues();


    questionData.forEach(
      function(row) {

        const questionId =
          String(
            row[
              questionIndex.question_id
            ] || ''
          ).trim();


        if (!questionId) {
          return;
        }


        let isActive = true;


        if (
          questionIndex.is_active !== -1
        ) {

          isActive =
            row[
              questionIndex.is_active
            ] === true ||
            String(
              row[
                questionIndex.is_active
              ]
            )
            .toUpperCase()
            .trim() === 'TRUE';

        }


        questionMap[
          questionId
        ] = {

          question_id:
            questionId,

          course_id:
            String(
              row[
                questionIndex.course_id
              ] || ''
            ).trim(),

          question_text:
            String(
              row[
                questionIndex.question_text
              ] || ''
            ).trim(),

          option_a:
            String(
              row[
                questionIndex.option_a
              ] || ''
            ).trim(),

          option_b:
            String(
              row[
                questionIndex.option_b
              ] || ''
            ).trim(),

          option_c:
            String(
              row[
                questionIndex.option_c
              ] || ''
            ).trim(),

          option_d:
            String(
              row[
                questionIndex.option_d
              ] || ''
            ).trim(),

          correct_option:
            String(
              row[
                questionIndex.correct_option
              ] || ''
            ).trim(),

          points:
            Number(
              row[
                questionIndex.points
              ] || 0
            ),

          category:
            questionIndex.category !== -1
              ? String(
                  row[
                    questionIndex.category
                  ] || ''
                ).trim()
              : '',

          topic_id:
            questionIndex.topic_id !== -1
              ? String(
                  row[
                    questionIndex.topic_id
                  ] || ''
                ).trim()
              : '',

          difficulty:
            questionIndex.difficulty !== -1
              ? String(
                  row[
                    questionIndex.difficulty
                  ] || ''
                ).trim()
              : '',

          is_active:
            isActive

        };

      }
    );

  }


  // =====================================================
  // GHÉP EXAM_QUESTIONS + QUESTIONS
  // =====================================================

  const questions =
    [];


  eqData.forEach(
    function(row) {

      const rowExamId =
        String(
          row[eqIndex.exam_id] || ''
        ).trim();


      if (
        rowExamId !== examId
      ) {

        return;

      }


      let isActive = true;


      if (
        eqIndex.is_active !== -1
      ) {

        isActive =
          row[
            eqIndex.is_active
          ] === true ||
          String(
            row[
              eqIndex.is_active
            ]
          )
          .toUpperCase()
          .trim() === 'TRUE';

      }


      if (!isActive) {
        return;
      }


      const questionId =
        String(
          row[
            eqIndex.question_id
          ] || ''
        ).trim();


      const question =
        questionMap[
          questionId
        ];


      // Câu hỏi đã bị xóa khỏi QUESTIONS
      if (!question) {
        return;
      }


      // Không đưa câu hỏi inactive vào đề đang chỉnh sửa
      if (
        question.is_active === false
      ) {
        return;
      }


      questions.push({

        exam_question_id:
          eqIndex.exam_question_id !== -1
            ? String(
                row[
                  eqIndex.exam_question_id
                ] || ''
              ).trim()
            : '',

        question_id:
          question.question_id,

        question_order:
          eqIndex.question_order !== -1
            ? Number(
                row[
                  eqIndex.question_order
                ] || 0
              )
            : 0,

        points:
          eqIndex.points !== -1
            ? Number(
                row[
                  eqIndex.points
                ] || 0
              )
            : question.points,

        question_text:
          question.question_text,

        option_a:
          question.option_a,

        option_b:
          question.option_b,

        option_c:
          question.option_c,

        option_d:
          question.option_d,

        correct_option:
          question.correct_option,

        category:
          question.category,

        topic_id:
          question.topic_id,

        difficulty:
          question.difficulty

      });

    }
  );


  // =====================================================
  // SẮP XẾP THEO THỨ TỰ TRONG ĐỀ
  // =====================================================

  questions.sort(
    function(a, b) {

      return (
        a.question_order -
        b.question_order
      );

    }
  );


  // =====================================================
  // TRẢ KẾT QUẢ
  // =====================================================

  return {

    exam:
      exam,

    questions:
      questions,

    total:
      questions.length

  };

}

function testGetExamData() {

  const result =
    getExamData('EX001');


  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}

function getAvailableQuestionsForExam(examId) {

  if (!examId) {
    throw new Error('Thiếu mã đề thi.');
  }

  examId = String(examId).trim();


  // =====================================================
  // LẤY THÔNG TIN ĐỀ
  // =====================================================

  const examsSheet =
    getSheet(CONFIG.SHEETS.EXAMS);

  const examLastRow =
    examsSheet.getLastRow();

  const examLastColumn =
    examsSheet.getLastColumn();

  if (examLastRow < 2) {
    throw new Error('Chưa có đề thi.');
  }


  const examHeaders =
    examsSheet
      .getRange(
        1,
        1,
        1,
        examLastColumn
      )
      .getValues()[0];

  const examIdIndex =
    examHeaders.indexOf('exam_id');

  const examCourseIndex =
    examHeaders.indexOf('course_id');

  if (
    examIdIndex === -1 ||
    examCourseIndex === -1
  ) {
    throw new Error(
      'EXAMS thiếu cột exam_id hoặc course_id.'
    );
  }


  const examData =
    examsSheet
      .getRange(
        2,
        1,
        examLastRow - 1,
        examLastColumn
      )
      .getValues();


  let examCourseId = '';


  const foundExam =
    examData.some(function(row) {

      if (
        String(
          row[examIdIndex] || ''
        ).trim() === examId
      ) {

        examCourseId =
          String(
            row[examCourseIndex] || ''
          ).trim();

        return true;
      }

      return false;

    });


  if (!foundExam) {
    throw new Error(
      'Không tìm thấy đề thi: ' +
      examId
    );
  }


  // =====================================================
  // LẤY CÁC CÂU ĐÃ CÓ TRONG ĐỀ
  // =====================================================

  const examQuestionsSheet =
    getSheet(
      CONFIG.SHEETS.EXAM_QUESTIONS
    );

  const eqLastRow =
    examQuestionsSheet.getLastRow();

  const existingQuestionIds = {};


  if (eqLastRow >= 2) {

    const eqLastColumn =
      examQuestionsSheet.getLastColumn();

    const eqHeaders =
      examQuestionsSheet
        .getRange(
          1,
          1,
          1,
          eqLastColumn
        )
        .getValues()[0];

    const eqExamIndex =
      eqHeaders.indexOf('exam_id');

    const eqQuestionIndex =
      eqHeaders.indexOf('question_id');

    const eqActiveIndex =
      eqHeaders.indexOf('is_active');


    if (
      eqExamIndex === -1 ||
      eqQuestionIndex === -1
    ) {

      throw new Error(
        'EXAM_QUESTIONS thiếu cột exam_id hoặc question_id.'
      );

    }


    const eqData =
      examQuestionsSheet
        .getRange(
          2,
          1,
          eqLastRow - 1,
          eqLastColumn
        )
        .getValues();


    eqData.forEach(function(row) {

      const rowExamId =
        String(
          row[eqExamIndex] || ''
        ).trim();


      if (
        rowExamId !== examId
      ) {
        return;
      }


      let isActive = true;


      if (
        eqActiveIndex !== -1
      ) {

        const value =
          row[eqActiveIndex];

        isActive =
          value === true ||
          String(value)
            .toUpperCase()
            .trim() === 'TRUE';

      }


      if (!isActive) {
        return;
      }


      const questionId =
        String(
          row[eqQuestionIndex] || ''
        ).trim();


      if (questionId) {
        existingQuestionIds[
          questionId
        ] = true;
      }

    });

  }


  // =====================================================
  // LẤY QUESTIONS
  // =====================================================

  const questionsSheet =
    getSheet(
      CONFIG.SHEETS.QUESTIONS
    );

  const questionLastRow =
    questionsSheet.getLastRow();

  const questionLastColumn =
    questionsSheet.getLastColumn();


  if (questionLastRow < 2) {
    return [];
  }


  const questionHeaders =
    questionsSheet
      .getRange(
        1,
        1,
        1,
        questionLastColumn
      )
      .getValues()[0];


  const index = {

    question_id:
      questionHeaders.indexOf(
        'question_id'
      ),

    course_id:
      questionHeaders.indexOf(
        'course_id'
      ),

    question_text:
      questionHeaders.indexOf(
        'question_text'
      ),

    option_a:
      questionHeaders.indexOf(
        'option_a'
      ),

    option_b:
      questionHeaders.indexOf(
        'option_b'
      ),

    option_c:
      questionHeaders.indexOf(
        'option_c'
      ),

    option_d:
      questionHeaders.indexOf(
        'option_d'
      ),

    correct_option:
      questionHeaders.indexOf(
        'correct_option'
      ),

    points:
      questionHeaders.indexOf(
        'points'
      ),

    topic_id:
      questionHeaders.indexOf(
        'topic_id'
      ),

    difficulty:
      questionHeaders.indexOf(
        'difficulty'
      ),

    is_active:
      questionHeaders.indexOf(
        'is_active'
      )

  };


  if (
    index.question_id === -1 ||
    index.course_id === -1 ||
    index.question_text === -1
  ) {

    throw new Error(
      'QUESTIONS thiếu các cột bắt buộc.'
    );

  }


  const questionData =
    questionsSheet
      .getRange(
        2,
        1,
        questionLastRow - 1,
        questionLastColumn
      )
      .getValues();


  // =====================================================
  // LẤY TOPICS
  // =====================================================

  const topicMap = {};

  const topicSheet =
    getSheet(
      CONFIG.SHEETS.TOPICS
    );

  const topicLastRow =
    topicSheet.getLastRow();

  const topicLastColumn =
    topicSheet.getLastColumn();


  if (topicLastRow >= 2) {

    const topicHeaders =
      topicSheet
        .getRange(
          1,
          1,
          1,
          topicLastColumn
        )
        .getValues()[0];


    const topicIdIndex =
      topicHeaders.indexOf(
        'topic_id'
      );

    const topicCourseIndex =
      topicHeaders.indexOf(
        'course_id'
      );

    const topicNameIndex =
      topicHeaders.indexOf(
        'topic_name'
      );


    const topicData =
      topicSheet
        .getRange(
          2,
          1,
          topicLastRow - 1,
          topicLastColumn
        )
        .getValues();


    topicData.forEach(function(row) {

      const topicId =
        String(
          row[topicIdIndex] || ''
        ).trim();


      if (!topicId) {
        return;
      }


      topicMap[topicId] = {

        topic_id:
          topicId,

        course_id:
          String(
            row[topicCourseIndex] || ''
          ).trim(),

        topic_name:
          String(
            row[topicNameIndex] || ''
          ).trim()

      };

    });

  }


  // =====================================================
  // LỌC CÂU HỎI KHẢ DỤNG
  // =====================================================

  const availableQuestions = [];


  questionData.forEach(function(row) {

    const questionId =
      String(
        row[index.question_id] || ''
      ).trim();


    if (!questionId) {
      return;
    }


    const questionCourseId =
      String(
        row[index.course_id] || ''
      ).trim();


    // Đúng học phần
    if (
      questionCourseId !==
      examCourseId
    ) {
      return;
    }


    // Không lấy câu đã bị xóa
    if (
      index.is_active !== -1
    ) {

      const value =
        row[index.is_active];

      const isActive =
        value === true ||
        String(value)
          .toUpperCase()
          .trim() === 'TRUE';


      if (!isActive) {
        return;
      }

    }


    // Không lấy câu đã có trong đề
    if (
      existingQuestionIds[
        questionId
      ]
    ) {
      return;
    }


    const topicId =
      index.topic_id !== -1
        ? String(
            row[index.topic_id] || ''
          ).trim()
        : '';


    const topic =
      topicMap[topicId];


    availableQuestions.push({

      question_id:
        questionId,

      course_id:
        questionCourseId,

      question_text:
        String(
          row[index.question_text] || ''
        ).trim(),

      option_a:
        index.option_a !== -1
          ? String(
              row[index.option_a] || ''
            ).trim()
          : '',

      option_b:
        index.option_b !== -1
          ? String(
              row[index.option_b] || ''
            ).trim()
          : '',

      option_c:
        index.option_c !== -1
          ? String(
              row[index.option_c] || ''
            ).trim()
          : '',

      option_d:
        index.option_d !== -1
          ? String(
              row[index.option_d] || ''
            ).trim()
          : '',

      correct_option:
        index.correct_option !== -1
          ? String(
              row[index.correct_option] || ''
            ).trim()
          : '',

      points:
        index.points !== -1
          ? Number(
              row[index.points] || 0
            )
          : 0,

      topic_id:
        topicId,

      topic_name:
        topic
          ? topic.topic_name
          : 'Chưa phân loại',

      difficulty:
        index.difficulty !== -1
          ? String(
              row[index.difficulty] || ''
            ).trim()
          : ''

    });

  });


  // =====================================================
  // SẮP XẾP
  // =====================================================

  availableQuestions.sort(
    function(a, b) {

      const topicCompare =
        String(
          a.topic_name || ''
        ).localeCompare(
          String(
            b.topic_name || ''
          ),
          'vi'
        );


      if (
        topicCompare !== 0
      ) {
        return topicCompare;
      }


      return a.question_id.localeCompare(
        b.question_id
      );

    }
  );


  return availableQuestions;

}

function testGetAvailableQuestionsForExam() {

  const result =
    getAvailableQuestionsForExam(
      'EX001'
    );


  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}

function addQuestionsToExam(examId, questionIds) {

  // =====================================================
  // KIỂM TRA DỮ LIỆU
  // =====================================================

  if (!examId) {
    throw new Error('Thiếu mã đề thi.');
  }

  if (!questionIds) {
    throw new Error('Chưa chọn câu hỏi.');
  }

  examId =
    String(examId).trim();


  // Cho phép truyền 1 ID hoặc mảng ID
  if (!Array.isArray(questionIds)) {

    questionIds = [
      questionIds
    ];

  }


  questionIds =
    questionIds
      .map(function(id) {
        return String(id).trim();
      })
      .filter(function(id) {
        return id !== '';
      });


  if (questionIds.length === 0) {

    throw new Error(
      'Chưa chọn câu hỏi nào.'
    );

  }


  // =====================================================
  // KIỂM TRA ĐỀ THI
  // =====================================================

  const examsSheet =
    getSheet(
      CONFIG.SHEETS.EXAMS
    );


  const examLastRow =
    examsSheet.getLastRow();


  const examLastColumn =
    examsSheet.getLastColumn();


  if (examLastRow < 2) {

    throw new Error(
      'Chưa có đề thi.'
    );

  }


  const examHeaders =
    examsSheet
      .getRange(
        1,
        1,
        1,
        examLastColumn
      )
      .getValues()[0];


  const examIdIndex =
    examHeaders.indexOf(
      'exam_id'
    );


  const examCourseIndex =
    examHeaders.indexOf(
      'course_id'
    );


  if (
    examIdIndex === -1 ||
    examCourseIndex === -1
  ) {

    throw new Error(
      'EXAMS thiếu cột exam_id hoặc course_id.'
    );

  }


  const examData =
    examsSheet
      .getRange(
        2,
        1,
        examLastRow - 1,
        examLastColumn
      )
      .getValues();


  let examCourseId = '';


  const examExists =
    examData.some(
      function(row) {

        if (
          String(
            row[examIdIndex] || ''
          ).trim() === examId
        ) {

          examCourseId =
            String(
              row[examCourseIndex] || ''
            ).trim();

          return true;

        }

        return false;

      }
    );


  if (!examExists) {

    throw new Error(
      'Không tìm thấy đề thi: ' +
      examId
    );

  }


  // =====================================================
  // LẤY EXAM_QUESTIONS
  // =====================================================

  const sheet =
    getSheet(
      CONFIG.SHEETS.EXAM_QUESTIONS
    );


  const lastRow =
    sheet.getLastRow();


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


  const index = {

    exam_question_id:
      headers.indexOf(
        'exam_question_id'
      ),

    exam_id:
      headers.indexOf(
        'exam_id'
      ),

    question_id:
      headers.indexOf(
        'question_id'
      ),

    question_order:
      headers.indexOf(
        'question_order'
      ),

    points:
      headers.indexOf(
        'points'
      ),

    is_active:
      headers.indexOf(
        'is_active'
      )

  };


  if (
    index.exam_question_id === -1 ||
    index.exam_id === -1 ||
    index.question_id === -1
  ) {

    throw new Error(
      'EXAM_QUESTIONS thiếu các cột bắt buộc.'
    );

  }


  // =====================================================
  // LẤY CÁC CÂU ĐÃ CÓ TRONG ĐỀ
  // =====================================================

  const existingQuestionIds = {};


  let maxOrder = 0;


  if (lastRow >= 2) {

    const data =
      sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          lastColumn
        )
        .getValues();


    data.forEach(
      function(row) {

        const rowExamId =
          String(
            row[index.exam_id] || ''
          ).trim();


        if (
          rowExamId !== examId
        ) {
          return;
        }


        // -------------------------------------------------
        // is_active
        // -------------------------------------------------

        let isActive = true;


        if (
          index.is_active !== -1
        ) {

          const value =
            row[index.is_active];


          isActive =
            value === true ||
            String(value)
              .toUpperCase()
              .trim() === 'TRUE';

        }


        if (!isActive) {
          return;
        }


        // -------------------------------------------------
        // QUESTION ID
        // -------------------------------------------------

        const questionId =
          String(
            row[index.question_id] || ''
          ).trim();


        if (questionId) {

          existingQuestionIds[
            questionId
          ] = true;

        }


        // -------------------------------------------------
        // QUESTION ORDER
        // -------------------------------------------------

        if (
          index.question_order !== -1
        ) {

          const order =
            Number(
              row[
                index.question_order
              ] || 0
            );


          if (
            order > maxOrder
          ) {

            maxOrder =
              order;

          }

        }

      }
    );

  }


  // =====================================================
  // LẤY QUESTIONS
  // =====================================================

  const questionsSheet =
    getSheet(
      CONFIG.SHEETS.QUESTIONS
    );


  const questionLastRow =
    questionsSheet.getLastRow();


  const questionLastColumn =
    questionsSheet.getLastColumn();


  if (
    questionLastRow < 2
  ) {

    throw new Error(
      'Chưa có câu hỏi trong ngân hàng.'
    );

  }


  const questionHeaders =
    questionsSheet
      .getRange(
        1,
        1,
        1,
        questionLastColumn
      )
      .getValues()[0];


  const questionIndex = {

    question_id:
      questionHeaders.indexOf(
        'question_id'
      ),

    course_id:
      questionHeaders.indexOf(
        'course_id'
      ),

    points:
      questionHeaders.indexOf(
        'points'
      ),

    is_active:
      questionHeaders.indexOf(
        'is_active'
      )

  };


  if (
    questionIndex.question_id === -1 ||
    questionIndex.course_id === -1
  ) {

    throw new Error(
      'QUESTIONS thiếu question_id hoặc course_id.'
    );

  }


  const questionData =
    questionsSheet
      .getRange(
        2,
        1,
        questionLastRow - 1,
        questionLastColumn
      )
      .getValues();


  const questionMap = {};


  questionData.forEach(
    function(row) {

      const questionId =
        String(
          row[
            questionIndex.question_id
          ] || ''
        ).trim();


      if (!questionId) {
        return;
      }


      const courseId =
        String(
          row[
            questionIndex.course_id
          ] || ''
        ).trim();


      // Chỉ lấy câu thuộc đúng học phần
      if (
        courseId !==
        examCourseId
      ) {
        return;
      }


      // Không lấy câu đã xóa
      if (
        questionIndex.is_active !== -1
      ) {

        const value =
          row[
            questionIndex.is_active
          ];


        const isActive =
          value === true ||
          String(value)
            .toUpperCase()
            .trim() === 'TRUE';


        if (!isActive) {
          return;
        }

      }


      questionMap[
        questionId
      ] = {

        question_id:
          questionId,

        points:
          questionIndex.points !== -1
            ? Number(
                row[
                  questionIndex.points
                ] || 0
              )
            : 0

      };

    }
  );


  // =====================================================
  // SINH ID VÀ CHUẨN BỊ GHI
  // =====================================================

  let maxExamQuestionNumber = 0;


  if (lastRow >= 2) {

    const allIds =
      sheet
        .getRange(
          2,
          index.exam_question_id + 1,
          lastRow - 1,
          1
        )
        .getValues();


    allIds.forEach(
      function(row) {

        const id =
          String(
            row[0] || ''
          ).trim();


        const match =
          id.match(/^EQ(\d+)$/);


        if (match) {

          const number =
            Number(match[1]);


          if (
            number >
            maxExamQuestionNumber
          ) {

            maxExamQuestionNumber =
              number;

          }

        }

      }
    );

  }


  const rowsToAppend = [];

  const addedQuestions = [];


  questionIds.forEach(
    function(questionId) {

      // -------------------------------------------------
      // Không thêm trùng
      // -------------------------------------------------

      if (
        existingQuestionIds[
          questionId
        ]
      ) {

        return;

      }


      // -------------------------------------------------
      // Câu hỏi phải tồn tại
      // -------------------------------------------------

      const question =
        questionMap[
          questionId
        ];


      if (!question) {

        throw new Error(
          'Câu hỏi không hợp lệ hoặc không thuộc học phần: ' +
          questionId
        );

      }


      maxExamQuestionNumber++;
      maxOrder++;


      const examQuestionId =
        'EQ' +
        String(
          maxExamQuestionNumber
        )
        .padStart(
          3,
          '0'
        );


      // -------------------------------------------------
      // TẠO DÒNG
      // -------------------------------------------------

      const row =
        new Array(
          lastColumn
        ).fill('');


      row[
        index.exam_question_id
      ] =
        examQuestionId;


      row[
        index.exam_id
      ] =
        examId;


      row[
        index.question_id
      ] =
        questionId;


      if (
        index.question_order !== -1
      ) {

        row[
          index.question_order
        ] =
          maxOrder;

      }


      if (
        index.points !== -1
      ) {

        row[
          index.points
        ] =
          question.points;

      }


      if (
        index.is_active !== -1
      ) {

        row[
          index.is_active
        ] =
          true;

      }


      rowsToAppend.push(row);


      addedQuestions.push({

        exam_question_id:
          examQuestionId,

        question_id:
          questionId,

        question_order:
          maxOrder,

        points:
          question.points

      });


      existingQuestionIds[
        questionId
      ] = true;

    }
  );


  // =====================================================
  // KHÔNG CÓ CÂU MỚI
  // =====================================================

  if (
    rowsToAppend.length === 0
  ) {

    return {

      success:
        true,

      exam_id:
        examId,

      added:
        0,

      questions:
        []

    };

  }


  // =====================================================
  // GHI DATABASE
  // =====================================================

  sheet
    .getRange(
      lastRow + 1,
      1,
      rowsToAppend.length,
      lastColumn
    )
    .setValues(
      rowsToAppend
    );

  // =====================================================
  // CẬP NHẬT TỔNG SỐ CÂU VÀ TỔNG ĐIỂM
  // =====================================================

  const totals =
    updateExamTotals(
      examId
    );

  // =====================================================
  // TRẢ KẾT QUẢ
  // =====================================================

  return {

    success:
      true,

    exam_id:
      examId,

    added:
      addedQuestions.length,

    questions:
      addedQuestions,

    total_questions:
      totals.total_questions,

    total_points:
      totals.total_points

  };

}

function testAddQuestionsToExam() {

  const result =
    addQuestionsToExam(
      'EX001',
      [
        'Q003',
        'Q004'
      ]
    );


  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}

function updateExamTotals(examId) {

  if (!examId) {
    throw new Error(
      'Thiếu mã đề thi.'
    );
  }

  examId =
    String(examId).trim();


  // =====================================================
  // LẤY EXAM_QUESTIONS
  // =====================================================

  const eqSheet =
    getSheet(
      CONFIG.SHEETS.EXAM_QUESTIONS
    );

  const eqLastRow =
    eqSheet.getLastRow();

  const eqLastColumn =
    eqSheet.getLastColumn();


  let totalQuestions = 0;
  let totalPoints = 0;


  if (eqLastRow >= 2) {

    const headers =
      eqSheet
        .getRange(
          1,
          1,
          1,
          eqLastColumn
        )
        .getValues()[0];


    const examIdIndex =
      headers.indexOf(
        'exam_id'
      );

    const pointsIndex =
      headers.indexOf(
        'points'
      );

    const activeIndex =
      headers.indexOf(
        'is_active'
      );


    if (
      examIdIndex === -1
    ) {

      throw new Error(
        'EXAM_QUESTIONS thiếu cột exam_id.'
      );

    }


    const data =
      eqSheet
        .getRange(
          2,
          1,
          eqLastRow - 1,
          eqLastColumn
        )
        .getValues();


    data.forEach(
      function(row) {

        const rowExamId =
          String(
            row[examIdIndex] || ''
          ).trim();


        if (
          rowExamId !== examId
        ) {
          return;
        }


        // -----------------------------------------------
        // Kiểm tra is_active
        // -----------------------------------------------

        let isActive = true;


        if (
          activeIndex !== -1
        ) {

          const value =
            row[activeIndex];


          isActive =
            value === true ||
            String(value)
              .toUpperCase()
              .trim() === 'TRUE';

        }


        if (!isActive) {
          return;
        }


        // -----------------------------------------------
        // Đếm câu
        // -----------------------------------------------

        totalQuestions++;


        // -----------------------------------------------
        // Cộng điểm
        // -----------------------------------------------

        if (
          pointsIndex !== -1
        ) {

          totalPoints +=
            Number(
              row[pointsIndex] || 0
            );

        }

      }
    );

  }


  // =====================================================
  // CẬP NHẬT EXAMS
  // =====================================================

  const examsSheet =
    getSheet(
      CONFIG.SHEETS.EXAMS
    );


  const examLastRow =
    examsSheet.getLastRow();

  const examLastColumn =
    examsSheet.getLastColumn();


  if (
    examLastRow < 2
  ) {

    throw new Error(
      'Chưa có dữ liệu đề thi.'
    );

  }


  const examHeaders =
    examsSheet
      .getRange(
        1,
        1,
        1,
        examLastColumn
      )
      .getValues()[0];


  const examIdIndex =
    examHeaders.indexOf(
      'exam_id'
    );

  const totalQuestionsIndex =
    examHeaders.indexOf(
      'total_questions'
    );

  const totalPointsIndex =
    examHeaders.indexOf(
      'total_points'
    );

  const updatedAtIndex =
    examHeaders.indexOf(
      'updated_at'
    );


  if (
    examIdIndex === -1
  ) {

    throw new Error(
      'EXAMS thiếu cột exam_id.'
    );

  }


  if (
    totalQuestionsIndex === -1 ||
    totalPointsIndex === -1
  ) {

    throw new Error(
      'EXAMS thiếu total_questions hoặc total_points.'
    );

  }


  const examData =
    examsSheet
      .getRange(
        2,
        1,
        examLastRow - 1,
        examLastColumn
      )
      .getValues();


  let targetRow = -1;


  examData.some(
    function(row, index) {

      const rowExamId =
        String(
          row[examIdIndex] || ''
        ).trim();


      if (
        rowExamId === examId
      ) {

        targetRow =
          index + 2;

        return true;

      }


      return false;

    }
  );


  if (
    targetRow === -1
  ) {

    throw new Error(
      'Không tìm thấy đề thi: ' +
      examId
    );

  }


  // =====================================================
  // GHI TỔNG SỐ CÂU
  // =====================================================

  examsSheet
    .getRange(
      targetRow,
      totalQuestionsIndex + 1
    )
    .setValue(
      totalQuestions
    );


  // =====================================================
  // GHI TỔNG ĐIỂM
  // =====================================================

  examsSheet
    .getRange(
      targetRow,
      totalPointsIndex + 1
    )
    .setValue(
      totalPoints
    );


  // =====================================================
  // CẬP NHẬT UPDATED_AT
  // =====================================================

  if (
    updatedAtIndex !== -1
  ) {

    examsSheet
      .getRange(
        targetRow,
        updatedAtIndex + 1
      )
      .setValue(
        new Date()
      );

  }


  // =====================================================
  // TRẢ KẾT QUẢ
  // =====================================================

  return {

    success:
      true,

    exam_id:
      examId,

    total_questions:
      totalQuestions,

    total_points:
      totalPoints

  };

}

function testUpdateExamTotals() {

  const result =
    updateExamTotals(
      'EX001'
    );


  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}

function getExamList(courseId) {

  if (!courseId) {

    throw new Error(
      'Thiếu mã học phần.'
    );

  }


  courseId =
    String(courseId).trim();


  const sheet =
    getSheet(
      CONFIG.SHEETS.EXAMS
    );


  if (!sheet) {

    throw new Error(
      'Không tìm thấy sheet EXAMS.'
    );

  }


  const lastRow =
    sheet.getLastRow();


  const lastColumn =
    sheet.getLastColumn();


  Logger.log(
    'getExamList courseId = ' +
    courseId
  );


  Logger.log(
    'EXAMS lastRow = ' +
    lastRow
  );


  Logger.log(
    'EXAMS lastColumn = ' +
    lastColumn
  );


  if (lastRow < 2) {

    return [];

  }


  const headers =
    sheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getValues()[0]
      .map(function(header) {

        return String(
          header || ''
        ).trim();

      });


  Logger.log(
    'EXAMS headers = ' +
    JSON.stringify(headers)
  );


  const examIdIndex =
    headers.indexOf(
      'exam_id'
    );


  const courseIdIndex =
    headers.indexOf(
      'course_id'
    );


  const examNameIndex =
    headers.indexOf(
      'exam_name'
    );


  if (
    examIdIndex === -1 ||
    courseIdIndex === -1 ||
    examNameIndex === -1
  ) {

    throw new Error(
      'EXAMS thiếu cột exam_id, course_id hoặc exam_name.'
    );

  }


  const data =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        lastColumn
      )
      .getValues();


  const exams = [];


  data.forEach(
    function(row) {

      const rowCourseId =
        String(
          row[courseIdIndex] || ''
        ).trim();


      Logger.log(
        'So sánh: [' +
        rowCourseId +
        '] với [' +
        courseId +
        ']'
      );


      if (
        rowCourseId !== courseId
      ) {

        return;

      }


      exams.push({

        exam_id:
          String(
            row[examIdIndex] || ''
          ).trim(),

        course_id:
          rowCourseId,

        exam_name:
          String(
            row[examNameIndex] || ''
          ).trim(),

        duration_minutes:
          headers.indexOf(
            'duration_minutes'
          ) !== -1
            ? Number(
                row[
                  headers.indexOf(
                    'duration_minutes'
                  )
                ] || 0
              )
            : 0,

        total_questions:
          headers.indexOf(
            'total_questions'
          ) !== -1
            ? Number(
                row[
                  headers.indexOf(
                    'total_questions'
                  )
                ] || 0
              )
            : 0,

        total_points:
          headers.indexOf(
            'total_points'
          ) !== -1
            ? Number(
                row[
                  headers.indexOf(
                    'total_points'
                  )
                ] || 0
              )
            : 0,

        status:
          headers.indexOf(
            'status'
          ) !== -1
            ? String(
                row[
                  headers.indexOf(
                    'status'
                  )
                ] || ''
              ).trim()
            : ''

      });

    }
  );


  Logger.log(
    'getExamList result = ' +
    JSON.stringify(exams)
  );


  return exams;

}

function testGetExamList() {

  const result =
    getExamList(
      'HP001'
    );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}