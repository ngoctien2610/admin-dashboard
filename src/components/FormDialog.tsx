import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  MenuItem,
  Stack,
  Paper,
} from '@mui/material';

interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'select';
  options?: { label: string; value: string }[];
  required?: boolean;
  defaultValue?: string;
}

interface FormDialogProps {
  open: boolean;
  title: string;
  fields: FormField[];
  initialValues?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  title,
  fields,
  initialValues = {},
  onSubmit,
  onClose,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(() => ({ ...initialValues }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({ ...initialValues });
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const target = e.target as any;
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: String(value) }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} là bắt buộc`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({ ...initialValues });
      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Lưu thất bại' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          {fields.map((field) =>
            field.type === 'select' ? (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                select
                value={formData[field.name] || ''}
                onChange={handleChange}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                fullWidth
                disabled={loading}
                required={field.required}
                variant="filled"
              >
                {field.options?.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type || 'text'}
                value={formData[field.name] || ''}
                onChange={handleChange}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                fullWidth
                disabled={loading}
                required={field.required}
                variant="filled"
              />
            )
          )}
          {errors.submit && <Box sx={{ color: 'error.main', typography: 'body2' }}>{errors.submit}</Box>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ py: 2, px: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
