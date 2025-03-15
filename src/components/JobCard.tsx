import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Briefcase, ExternalLink, Clock, Check, Trash2 } from 'lucide-react';
import { Job, JobType, JOB_TYPES } from '../types/job';
import { ApplyModal } from './ApplyModal';
import { supabase } from '../lib/supabase';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  applicationData: { id: string; resume_url: string } | null;
  onApplicationUpdate: (jobId: string, data: { id: string; resume_url: string } | null) => void;
}

export function JobCard({ job, onSelect, applicationData, onApplicationUpdate }: JobCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const hasApplied = Boolean(applicationData);

  const handleApply = async (formData: FormData) => {
    try {
      if (!job.id) {
        throw new Error('Job ID is required');
      }

      const file = formData.get('resume') as File;
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      // Store in a consistent path structure
      const filePath = `public/${job.id}/${fileName}`;

      console.log('Uploading file to:', filePath);

      // Upload file
      const { data: storageData, error: storageError } = await supabase.storage
        .from('resumes')  // Use fixed bucket name
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      console.log('Upload response:', { data: storageData, error: storageError });

      if (storageError) {
        console.error('Storage error:', storageError);
        throw new Error(`Upload failed: ${storageError.message}`);
      }

      // Get URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from('resumes')  // Use fixed bucket name
        .getPublicUrl(filePath);

      if (urlError) {
        throw new Error('Failed to get file URL');
      }

      // Save to database
      const { data, error: dbError } = await supabase
        .from('applications')
        .insert([{
          job_id: job.id,
          resume_url: urlData.publicUrl,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database save failed: ${dbError.message}`);
      }

      // Store the application data
      onApplicationUpdate(job.id, data);
      setIsModalOpen(false);
      return true;
    } catch (error) {
      console.error('Application error:', error);
      throw error;
    }
  };

  const handleRemoveApplication = async () => {
    if (!applicationData) return;
    
    try {
      setIsRemoving(true);
      
      // Get the file path from the URL
      const fileUrl = applicationData.resume_url;
      console.log('Original File URL:', fileUrl);

      // First get all files in the job's folder to find our file
      const { data: files, error: listError } = await supabase.storage
        .from('resumes')
        .list(`public/${job.id}`);

      if (listError) {
        console.error('Error listing files:', listError);
        throw new Error('Failed to list files');
      }

      console.log('Files in folder:', files);

      // Extract filename from URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      console.log('File name to delete:', fileName);

      // Find our file in the list
      const file = files?.find(f => f.name === fileName);
      
      if (!file) {
        console.error('File not found in storage. Available files:', files?.map(f => f.name));
        // If file is not found, we can proceed with database deletion
        console.log('Proceeding with database deletion as file is not found');
      } else {
        // File exists, try to delete it
        const filePath = `public/${job.id}/${file.name}`;
        console.log('Attempting to remove file:', filePath);

        const { error: storageError } = await supabase.storage
          .from('resumes')
          .remove([filePath]);

        if (storageError) {
          console.error('Storage delete error:', storageError);
          // Log but don't throw error, proceed with database deletion
          console.log('Proceeding with database deletion despite storage error');
        } else {
          console.log('File successfully deleted from storage');
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationData.id);

      if (dbError) {
        console.error('Database delete error:', dbError);
        throw new Error('Failed to remove application from database');
      }

      console.log('Application successfully deleted from database');
      onApplicationUpdate(job.id, null);
    } catch (error) {
      console.error('Remove error:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const getJobTypeStyle = (jobType: JobType) => {
    if (!jobType || jobType === JOB_TYPES.UNKNOWN) {
      return 'bg-gray-100 text-gray-800';
    }

    switch (jobType) {
      case JOB_TYPES.REMOTE:
        return 'bg-green-100 text-green-800';
      case JOB_TYPES.HYBRID:
        return 'bg-blue-100 text-blue-800';
      case JOB_TYPES.FULL_TIME:
        return 'bg-purple-100 text-purple-800';
      case JOB_TYPES.CONTRACT:
        return 'bg-orange-100 text-orange-800';
      case JOB_TYPES.PART_TIME:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatJobType = (jobType: JobType) => {
    if (!jobType) return 'Not Specified';
    if (jobType === JOB_TYPES.UNKNOWN) return 'Other';
    
    return jobType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4"
      onClick={(e) => {
        // Only trigger selection if click is not on interactive elements
        const target = e.nativeEvent.target as HTMLElement;
        if (!target?.closest?.('button, a, [role="button"]')) {
          onSelect(job);
        }
      }}
    >
      <div className="flex flex-col h-full">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{job.title}</h3>
          <div className="flex items-center mt-2 text-gray-600 text-sm">
            <Building2 className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{job.company}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${getJobTypeStyle(job.job_type)}`}>
              {formatJobType(job.job_type)}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-800">
              {job.experience}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-800 capitalize">
              {job.source}
            </span>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600 line-clamp-2">
          {job.description}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <Clock className="inline-block w-3 h-3 mr-1" />
            {new Date(job.posted_at).toLocaleDateString()}
          </div>
          {hasApplied ? (
            <span className="text-xs text-green-600 flex items-center">
              <Check className="w-3 h-3 mr-1" />
              Applied
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Apply
            </button>
          )}
        </div>
      </div>

      <ApplyModal
        isOpen={isModalOpen && !hasApplied}
        onClose={() => setIsModalOpen(false)}
        jobTitle={job.title}
        onSubmit={handleApply}
      />
    </div>
  );
}