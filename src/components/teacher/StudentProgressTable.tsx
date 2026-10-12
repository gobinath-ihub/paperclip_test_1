import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Search, ArrowUpDown, ChevronRight, User, AlertTriangle } from 'lucide-react';
import type { TeacherStudentEntry } from '../../types/teacher';
import './StudentProgressTable.css';

interface StudentProgressTableProps {
  students: TeacherStudentEntry[];
}

export const StudentProgressTable: React.FC<StudentProgressTableProps> = ({ students }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'mastery' | 'attempts' | 'correctionRate'>('mastery');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.studentId.toLowerCase().includes(search.toLowerCase()) ||
          s.topic.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [students, search, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: 'name' | 'mastery' | 'attempts' | 'correctionRate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (status: TeacherStudentEntry['status']) => {
    switch (status) {
      case 'excelling':
        return <Badge variant="success">Excelling</Badge>;
      case 'struggling':
        return <Badge variant="destructive">Needs Support</Badge>;
      case 'active':
        return <Badge variant="brand">On Track</Badge>;
      default:
        return <Badge variant="muted">Inactive</Badge>;
    }
  };

  return (
    <Card variant="default" className="student-table-card">
      <CardHeader>
        <div className="table-controls-row">
          <div className="table-search-wrap">
            <Search size={16} className="table-search-icon" />
            <input
              type="text"
              placeholder="Search students by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="table-search-input"
            />
          </div>

          <div className="table-filters-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="table-status-select"
            >
              <option value="all">All Statuses ({students.length})</option>
              <option value="struggling">Needs Support</option>
              <option value="active">On Track</option>
              <option value="excelling">Excelling</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="table-content-area">
        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable-th">
                  <div className="th-content">
                    Student <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Status</th>
                <th onClick={() => handleSort('mastery')} className="sortable-th">
                  <div className="th-content">
                    Mastery <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('attempts')} className="sortable-th">
                  <div className="th-content">
                    Attempts <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('correctionRate')} className="sortable-th">
                  <div className="th-content">
                    Correction Rate <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Top Misconception</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.studentId} className="student-row">
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar-mini">
                        <User size={14} />
                      </div>
                      <div>
                        <div className="student-name">{student.name}</div>
                        <div className="student-id-sub">ID: {student.studentId} • Gr {student.grade}</div>
                      </div>
                    </div>
                  </td>
                  <td>{getStatusBadge(student.status)}</td>
                  <td className="mastery-cell">
                    <div className="mastery-cell-content">
                      <ProgressBar
                        value={student.mastery}
                        variant={student.mastery >= 80 ? 'success' : student.mastery >= 60 ? 'primary' : 'warning'}
                        size="sm"
                        showPercentage={false}
                      />
                      <span className="mastery-pct-text">{student.mastery}%</span>
                    </div>
                  </td>
                  <td className="attempts-cell">{student.attempts}</td>
                  <td className="rate-cell">
                    <span className={student.correctionRate >= 70 ? 'text-success' : 'text-warning'}>
                      {student.correctionRate}%
                    </span>
                  </td>
                  <td>
                    {student.topMisconception ? (
                      <div className="misconception-cell">
                        <AlertTriangle size={12} className="text-warning" />
                        <span>{student.topMisconceptionLabel || student.topMisconception}</span>
                      </div>
                    ) : (
                      <span className="text-muted">— None detected —</span>
                    )}
                  </td>
                  <td className="text-right">
                    <Link
                      to={`/teacher/students/${student.studentId}`}
                      className="view-details-link"
                    >
                      View Profile <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
