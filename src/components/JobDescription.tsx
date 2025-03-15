import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Briefcase, Clock, Check, Trash2 } from 'lucide-react';
import { Job } from '../types/job';
import { supabase } from '../lib/supabase';
import { ApplyModal } from './ApplyModal';

interface JobDescriptionProps {
  job: Job;
  onClose: () => void;
  applicationData: { id: string; resume_url: string; } | null;
  onApplicationUpdate: (jobId: string, data: { id: string; resume_url: string; } | null) => void;
}

export function JobDescription({ job, onClose, applicationData, onApplicationUpdate }: JobDescriptionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const hasApplied = Boolean(applicationData);

  const handleApply = async (formData: FormData) => {
    try {
      const file = formData.get('resume') as File;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/${job.id}/${fileName}`;

      // Upload resume
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // Save application
      const { data, error: dbError } = await supabase
        .from('applications')
        .insert([{
          job_id: job.id,
          resume_url: urlData.publicUrl,
          status: 'pending'
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      onApplicationUpdate(job.id, data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Application error:', error);
      throw error;
    }
  };

  const handleWithdraw = async () => {
    if (!applicationData) return;
    
    try {
      setIsWithdrawing(true);

      // Delete resume file
      if (applicationData.resume_url) {
        const urlParts = applicationData.resume_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `public/${job.id}/${fileName}`;

        await supabase.storage
          .from('resumes')
          .remove([filePath]);
      }

      // Delete application record
      await supabase
        .from('applications')
        .delete()
        .eq('id', applicationData.id);

      onApplicationUpdate(job.id, null);
    } catch (error) {
      console.error('Withdraw error:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <button
          onClick={onClose}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          ← Back to Jobs
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{job.title}</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Building2 className="w-5 h-5 mr-2" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Briefcase className="w-5 h-5 mr-2" />
              <span>{job.experience}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              <span>Posted {new Date(job.posted_date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-4">Job Description</h2>
            <p className="whitespace-pre-line">{job.description}</p>
          </div>

          <div className="flex justify-end space-x-4">
            {hasApplied ? (
              <>
                <button
                  disabled
                  className="bg-green-600 text-white px-6 py-2 rounded-md flex items-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Applied</span>
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="text-red-600 hover:text-red-800 px-6 py-2 rounded-md flex items-center space-x-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>{isWithdrawing ? 'Withdrawing...' : 'Withdraw Application'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>

      <ApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobTitle={job.title}
        onSubmit={handleApply}
      />
    </div>
  );
} 