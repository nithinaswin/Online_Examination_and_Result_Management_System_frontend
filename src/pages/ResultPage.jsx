import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function ResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      const res = await api.get(`/api/student/attempts/${attemptId}/result`);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to retrieve examination result.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>Loading examination result...</div>;
  if (error) return <div className="card" style={{ maxWidth: '600px', margin: '40px auto', padding: '30px' }}><div className="alert-box alert-danger">{error}</div><Link to="/dashboard" className="btn btn-secondary btn-block">Return to Dashboard</Link></div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px', borderTop: `6px solid ${result.passed ? 'var(--success)' : 'var(--danger)'}` }}>
        <span className={`badge ${result.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '14px', padding: '6px 14px', marginBottom: '16px' }}>
          {result.passed ? 'PASSED' : 'FAILED'}
        </span>

        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>{result.examTitle}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Submitted on {new Date(result.submittedAt).toLocaleString()}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '36px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: result.passed ? 'var(--success)' : 'var(--danger)' }}>
              {result.score} / {result.totalMarks}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Score (Pass mark: {result.passMarks})</div>
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {result.percentage?.toFixed(1)}%
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Percentage</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link to="/dashboard" className="btn btn-secondary">Back to Exams</Link>
          <Link to="/history" className="btn btn-primary">View All Results</Link>
        </div>
      </div>

      {/* Per-Question Review */}
      {result.questionsReview && result.questionsReview.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Question Review & Explanations</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {result.questionsReview.map((q, idx) => {
              const isCorrect = q.selectedOption === q.correctOption;

              return (
                <div key={q.questionId} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: isCorrect ? 'var(--success-bg)' : '#fef2f2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>Q{idx + 1}. {q.questionText}</strong>
                    <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`}>
                      {isCorrect ? `+${q.marks} Marks` : '0 Marks'}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Your Answer:</strong> Option {q.selectedOption || 'Not Attempted'}</div>
                    <div><strong>Correct Answer:</strong> Option {q.correctOption}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
