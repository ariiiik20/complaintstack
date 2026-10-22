import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  Stack,
  Alert,
  Chip,
} from '@mui/material';
import { Send, AttachFile, Close, InsertDriveFile, Image as ImageIcon } from '@mui/icons-material';
import { useComplaints } from '../../context/ComplaintContext';
import { toast } from 'react-toastify';

const categories = ['IT', 'Facility', 'HR', 'Finance', 'Maintenance', 'Billing', 'Academic', 'General'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ComplaintForm = ({ onSuccess }) => {
  const { createComplaint } = useComplaints();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.warning(`You can attach a maximum of ${MAX_FILES} files per complaint.`);
      return;
    }

    const validFiles = [];
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the 5MB file size limit.`);
        continue;
      }
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext)) {
        toast.error(`"${file.name}" is not a supported format (JPG, PNG, WEBP, PDF only).`);
        continue;
      }
      validFiles.push(file);
    }

    setFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build FormData for multipart upload
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      data.append('priority', formData.priority);

      files.forEach((file) => {
        data.append('attachments', file);
      });

      await createComplaint(data);
      toast.success('Complaint submitted successfully!');
      setFormData({ title: '', description: '', category: '', priority: 'Medium' });
      setFiles([]);
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h5"
          fontWeight={800}
          gutterBottom
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #F8FAFC 0%, #818CF8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.01em',
          }}
        >
          📝 Submit New Complaint
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '12px',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#FB7185',
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Brief summary of your complaint"
              inputProps={{ maxLength: 200 }}
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your issue in detail..."
              inputProps={{ maxLength: 5000 }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                fullWidth
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                fullWidth
              >
                {priorities.map((pri) => (
                  <MenuItem key={pri} value={pri}>
                    {pri}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* File Attachments Upload Section */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px dashed rgba(255, 255, 255, 0.18)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#F8FAFC', fontWeight: 600 }}>
                  <AttachFile sx={{ fontSize: 20, color: '#818CF8' }} />
                  Attachments ({files.length}/{MAX_FILES})
                </Typography>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: 'none' }}
                />

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={files.length >= MAX_FILES || loading}
                  startIcon={<AttachFile />}
                  sx={{
                    borderRadius: '10px',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#F8FAFC',
                    fontSize: '0.78rem',
                  }}
                >
                  Choose Files
                </Button>
              </Box>

              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: files.length ? 1.5 : 0 }}>
                Allowed formats: JPG, PNG, WEBP, PDF (Max 5MB each, up to 3 files)
              </Typography>

              {/* Selected Files Badges */}
              {files.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                  {files.map((file, index) => {
                    const isPdf = file.name.endsWith('.pdf');
                    return (
                      <Chip
                        key={index}
                        icon={isPdf ? <InsertDriveFile sx={{ fontSize: 16, color: '#38BDF8 !important' }} /> : <ImageIcon sx={{ fontSize: 16, color: '#818CF8 !important' }} />}
                        label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                        onDelete={() => handleRemoveFile(index)}
                        deleteIcon={<Close sx={{ fontSize: 14, color: '#FB7185 !important' }} />}
                        sx={{
                          borderColor: 'rgba(129, 140, 248, 0.3)',
                          bgcolor: 'rgba(99, 102, 241, 0.14)',
                          backdropFilter: 'blur(8px)',
                          color: '#F8FAFC',
                          fontSize: '0.78rem',
                          borderRadius: '10px',
                        }}
                      />
                    );
                  })}
                </Stack>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !formData.title || !formData.description || !formData.category}
                startIcon={<Send />}
                sx={{
                  minWidth: 180,
                  py: 1.4,
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ComplaintForm;
