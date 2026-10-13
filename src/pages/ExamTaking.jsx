import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ExamTaking() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [attemptData, setAttemptData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedReview, setMarkedReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);

  const timerRef = useRef(null);
  const autoSubmitTriggered = useRef(false);

  useEffect(() => {
    startOrResumeExam();

    const handleVisibilityChange = () => {
      if (document.hidden && attemptData) {
        recordTabSwitch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId]);

  const startOrResumeExam = async () => {
    try {
      const res = await api.post(`/api/student/exams/${examId}/start`);
      const data = res.data.data;
      setAttemptData(data);
      setQuestions(data.questions || []);
      setAnswers(data.savedAnswers || {});
      setTabSwitches(data.tabSwitchCount || 0);

      // Server deadline countdown
      const deadlineMs = new Date(data.deadline).getTime();
      const nowMs = Date.now();
      const initialSeconds = Math.max(0, Math.floor((deadlineMs - nowMs) / 1000));
      setTimeLeft(initialSeconds);

      startTimer(deadlineMs);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start or resume exam attempt.');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (deadlineMs) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (!autoSubmitTriggered.current) {
          autoSubmitTriggered.current = true;
          handleFinalSubmit(true);
        }
      }
    }, 1000);
  };

  const recordTabSwitch = async () => {
    if (!attemptData) return;
    try {
      const res = await api.post(`/api/student/attempts/${attemptData.attemptId}/tab-switch`);
      const count = res.data.data?.tabSwitchCount || tabSwitches + 1;
      setTabSwitches(count);
      alert(`⚠️ Tab switch detected! (Count: ${count}). Note: Switching tabs is recorded for proctoring.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectOption = async (option) => {
    const q = questions[currentIndex];
    if (!q) return;

    const newAnswers = { ...answers, [q.id]: option };
    setAnswers(newAnswers);

    // Auto-save answer to server
    try {
      await api.post(`/api/student/attempts/${attemptData.attemptId}/answers`, {
        questionId: q.id,
        selectedOption: option,
      });
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
    }
  };

  const toggleReview = (qId) => {
    const nextSet = new Set(markedReview);
    if (nextSet.has(qId)) {
      nextSet.delete(qId);
    } else {
      nextSet.add(qId);
    }
    setMarkedReview(nextSet);
  };

  const handleFinalSubmit = async (isAuto = false) => {
    setSubmitting(true);
    setShowConfirmModal(false);
    try {
      const answersList = Object.entries(answers).map(([qId, opt]) => ({
        questionId: parseInt(qId),
        selectedOption: opt,
      }));

      const res = await api.post(`/api/student/attempts/${attemptData.attemptId}/submit`, {
        answers: answersList,
      });

      const result = res.data.data;
      navigate(`/result/${result.attemptId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting exam. Please contact proctor.');
      setSubmitting(false);
    }
  };

  const formatTimer = (secs) => {
    if (secs == null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="card" style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '40px' }}>Loading examination session...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '60px auto', padding: '30px' }}>
        <div className="alert-box alert-danger">{error}</div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-block">Return to Dashboard</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isAnswered = currentQ && answers[currentQ.id];
  const isReviewed = currentQ && markedReview.has(currentQ.id);

  return (
    <div>
      <header className="exam-taking-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{attemptData?.examTitle}</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Question {currentIndex + 1} of {questions.length} • Switch count: {tabSwitches}
          </span>
        </div>
        <div className={`timer-box ${timeLeft < 180 ? 'timer-urgent' : ''}`}>
          ⏳ {formatTimer(timeLeft)}
        </div>
      </header>

      <div className="exam-taking-grid">
        {/* Left Column: Question & Options */}
        <div className="card">
          {currentQ ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span className="badge badge-info">Marks: {currentQ.marks}</span>
                <button
                  type="button"
                  onClick={() => toggleReview(currentQ.id)}
                  className={`btn ${isReviewed ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  {isReviewed ? '★ Marked for Review' : '☆ Mark for Review'}
                </button>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', lineHeight: '1.6' }}>
                {currentIndex + 1}. {currentQ.questionText}
              </h3>

              <div>
                {['A', 'B', 'C', 'D'].map((optKey) => {
                  const optText = currentQ[`option${optKey}`];
                  const selected = answers[currentQ.id] === optKey;
                  return (
                    <div
                      key={optKey}
                      className={`option-item ${selected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(optKey)}
                    >
                      <div className="option-letter">{optKey}</div>
                      <div>{optText}</div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <button
                  className="btn btn-secondary"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                >
                  ← Previous
                </button>
                {currentIndex < questions.length - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowConfirmModal(true)}
                  >
                    Submit Exam
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>No questions available in this examination.</div>
          )}
        </div>

        {/* Right Column: Question Palette & Status */}
        <div className="card">
          <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Question Palette</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '2px', display: 'inline-block' }}></span>
              Answered ({Object.keys(answers).length})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--warning)', borderRadius: '2px', display: 'inline-block' }}></span>
              Marked for Review ({markedReview.size})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '2px', display: 'inline-block' }}></span>
              Unanswered ({questions.length - Object.keys(answers).length})
            </div>
          </div>

          <div className="question-palette">
            {questions.map((q, idx) => {
              const answered = !!answers[q.id];
              const review = markedReview.has(q.id);
              const isCurrent = idx === currentIndex;

              let btnClass = 'palette-btn';
              if (isCurrent) btnClass += ' current';
              if (review) btnClass += ' review';
              else if (answered) btnClass += ' answered';

              return (
                <button
                  key={q.id}
                  className={btnClass}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '32px' }}>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="btn btn-danger btn-block"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Finish & Submit Exam'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Confirm Exam Submission</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You have answered <strong>{Object.keys(answers).length}</strong> of <strong>{questions.length}</strong> questions.
              Once submitted, you cannot modify your answers.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
              >
                Continue Exam
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleFinalSubmit(false)}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
