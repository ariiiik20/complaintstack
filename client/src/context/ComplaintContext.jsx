import { createContext, useContext, useState, useCallback } from 'react';
import API from '../api/axios';

const ComplaintContext = createContext(null);

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);

  // USER: Create complaint
  const createComplaint = useCallback(async (complaintData) => {
    const isFormData = complaintData instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const { data } = await API.post('/complaints', complaintData, config);
    setComplaints((prev) => [data.complaint, ...prev]);
    return data;
  }, []);

  // USER: Get my complaints
  const getMyComplaints = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await API.get('/complaints/my-complaints', { params });
      setComplaints(data.complaints);
      setPagination(data.pagination);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  // AGENT: Get assigned complaints
  const getAssignedComplaints = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await API.get('/complaints/assigned', { params });
      setComplaints(data.complaints);
      setPagination(data.pagination);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  // ADMIN: Get all complaints
  const getAllComplaints = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await API.get('/complaints', { params });
      setComplaints(data.complaints);
      setPagination(data.pagination);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single complaint
  const getComplaintById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/complaints/${id}`);
      setCurrentComplaint(data.complaint);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  // AGENT: Update status
  const updateComplaintStatus = useCallback(async (id, statusData) => {
    const { data } = await API.put(`/complaints/${id}/status`, statusData);
    setComplaints((prev) =>
      prev.map((c) => (c._id === id ? data.complaint : c))
    );
    setCurrentComplaint(data.complaint);
    return data;
  }, []);

  // ADMIN: Assign agent
  const assignAgent = useCallback(async (id, agentId) => {
    const { data } = await API.put(`/complaints/${id}/assign`, { agentId });
    setComplaints((prev) =>
      prev.map((c) => (c._id === id ? data.complaint : c))
    );
    return data;
  }, []);

  const value = {
    complaints,
    currentComplaint,
    pagination,
    loading,
    createComplaint,
    getMyComplaints,
    getAssignedComplaints,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    assignAgent,
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};

export default ComplaintContext;
