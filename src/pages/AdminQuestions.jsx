import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminQuestions() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    marks: 1,
  });
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        api.get(`/api/exams/${examId}`),
        api.get(`/api/admin/exams/${examId}/questions`),
      ]);
      setExam(examRes.data.data);
      setQuestions(questionsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingQ(null);
    setFormData({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      marks: 1,
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQ(q);
    setFormData({
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      marks: q.marks,
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question? Total marks will be recalculated.')) {
      return;
    }
    try {
      await api.delete(`/api/admin/questions/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete question.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editingQ) {
        await api.put(`/api/admin/questions/${editingQ.id}`, formData);
      } else {
        await api.post(`/api/admin/exams/${examId}/questions`, formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Parse CSV: QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks
      const lines = bulkCsvText.trim().split('\n');
      const parsed = lines.map((line) => {
        const parts = line.split('|').map((s) => s.trim());
        if (parts.length < 6) {
          throw new Error(`Invalid format in line: "${line}". Must have at least 6 pipe-separated parts.`);
        }
        return {
          questionText: parts[0],
          optionA: parts[1],
          optionB: parts[2],
          optionC: parts[3],
          optionD: parts[4],
          correctOption: parts[5].toUpperCase(),
          marks: parts[6] ? parseInt(parts[6]) : 1,
        };
      });

      await api.post(`/api/admin/exams/${examId}/questions/bulk`, parsed);
      setShowBulkModal(false);
      setBulkCsvText('');
      fetchData();
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to bulk import questions.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <Link to="/admin/exams" style={{ color: 'var(--primary)', textDecoration: 'none' }}>← Back to Exams</Link>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Manage Questions: {exam?.title}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Total Questions: {questions.length} • Total Exam Marks: {exam?.totalMarks || 0}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowBulkModal(true)} className="btn btn-secondary">
            Bulk Add (Pipe/CSV)
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            + Add Question
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <h3>No Questions Added Yet</h3>
            <p>Add single or bulk questions to configure this examination.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Options</th>
                  <th>Correct</th>
                  <th>Marks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, idx) => (
                  <tr key={q.id}>
                    <td>{idx + 1}</td>
                    <td style={{ maxWidth: '300px' }}><strong>{q.questionText}</strong></td>
                    <td style={{ fontSize: '13px' }}>
                      <div>A: {q.optionA}</div>
                      <div>B: {q.optionB}</div>
                      <div>C: {q.optionC}</div>
                      <div>D: {q.optionD}</div>
                    </td>
                    <td>
                      <span className="badge badge-success">Option {q.correctOption}</span>
                    </td>
                    <td>{q.marks}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenEdit(q)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              {editingQ ? 'Edit Question' : 'Add Question'}
            </h3>

            {error && <div className="alert-box alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter the question statement..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Option A</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.optionA}
                    onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Option B</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.optionB}
                    onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Option C</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.optionC}
                    onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Option D</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.optionD}
                    onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Correct Option</label>
                  <select
                    className="form-input"
                    value={formData.correctOption}
                    onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Marks</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Bulk Import Questions</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Paste one question per line separated by pipes (<code>|</code>):<br />
              <code>QuestionText | OptionA | OptionB | OptionC | OptionD | CorrectOption | Marks</code>
            </p>

            {error && <div className="alert-box alert-danger">{error}</div>}

            <form onSubmit={handleBulkSubmit}>
              <div className="form-group">
                <textarea
                  className="form-input"
                  rows="7"
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                  placeholder={`What is Java? | Programming Language | OS | Browser | CPU | A | 2\nWhich tag is used for image? | img | pic | src | a | A | 1`}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Importing...' : 'Import Questions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
