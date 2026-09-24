import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { FolderGit2, Plus, Calendar, Tag, CheckCircle2, Layers } from 'lucide-react';

export const ProjectCatalog = () => {
  const { projects, createNewProject, searchTerm } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    ProjectTitle: '',
    Description: '',
    Department: 'Computer Science',
    TechStack: 'React, Node.js, Python'
  });

  const filteredProjects = searchTerm
    ? projects.filter(p =>
        p.ProjectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : projects;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.ProjectTitle || !form.Description) return;
    createNewProject(form);
    setShowAddModal(false);
    setForm({ ProjectTitle: '', Description: '', Department: 'Computer Science', TechStack: 'React, Node.js' });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FolderGit2 size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Project Master Catalog (`SPM_Project`)</span>
          </h1>
          <p className="page-subtitle">Repository of approved student project topics available for faculty allocation.</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Create New Project Definition</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredProjects.map(proj => (
          <div key={proj.ProjectID} className="glass-panel glass-panel-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-ongoing" style={{ marginBottom: '0.4rem' }}>{proj.Department}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', lineHeight: '1.3' }}>{proj.ProjectTitle}</h3>
              </div>
              <span className={`badge ${proj.IsActive ? 'badge-completed' : 'badge-cancelled'}`}>
                {proj.IsActive ? 'Active' : 'Archived'}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.25rem', flex: 1, lineHeight: '1.5' }}>
              {proj.Description}
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                <Tag size={12} style={{ color: 'var(--accent-primary)' }} />
                Required Technology Stack
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>{proj.TechStack}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} />
                <span>Created: {proj.CreatedAt}</span>
              </div>
              <span>ID #{proj.ProjectID}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <Modal isOpen={true} onClose={() => setShowAddModal(false)} title="Create New Project Definition">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Project Title *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Distributed Quantum Cryptography Simulator"
                required
                value={form.ProjectTitle}
                onChange={(e) => setForm({ ...form, ProjectTitle: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Project Description *</label>
              <textarea
                className="input-field"
                rows="4"
                placeholder="Describe project objectives, scope, and target outcomes..."
                required
                value={form.Description}
                onChange={(e) => setForm({ ...form, Description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Department</label>
                <select
                  className="input-field"
                  value={form.Department}
                  onChange={(e) => setForm({ ...form, Department: e.target.value })}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Tech Stack Keywords</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="React, Node.js, Python, Docker"
                  value={form.TechStack}
                  onChange={(e) => setForm({ ...form, TechStack: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} />
                <span>Publish to Master Catalog</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
