import { JOB_TYPES, JobType, isValidJobType } from '../types/job';
import { ReceivedJobDTO, JobDTO } from '../types/dtos';

export class JobMapper {
  static toJobDTO(receivedJob: ReceivedJobDTO): JobDTO {
    const normalizedJobType = this.normalizeJobType(receivedJob.job_type);
    
    return {
      ...(receivedJob.id && { id: receivedJob.id }),
      title: receivedJob.title.trim(),
      company: receivedJob.company.trim(),
      job_type: normalizedJobType,
      experience: this.normalizeExperience(receivedJob.experience),
      description: receivedJob.description.trim(),
      application_link: receivedJob.application_link,
      source: receivedJob.source.toLowerCase(),
      posted_date: new Date(receivedJob.posted_date),
    };
  }

  private static normalizeJobType(jobType: string | null): JobType {
    if (!jobType) return null;
    
    const type = jobType.toLowerCase().trim();
    
    // Check for exact matches first
    if (isValidJobType(type)) {
      return type;
    }

    // Map similar terms to valid types
    if (type.includes('remote') || type.includes('wfh') || type.includes('work from home')) {
      return JOB_TYPES.REMOTE;
    }
    if (type.includes('hybrid') || type.includes('flexible')) {
      return JOB_TYPES.HYBRID;
    }
    if (type.includes('onsite') || type.includes('in office') || type.includes('on-site')) {
      return JOB_TYPES.ONSITE;
    }
    if (type.includes('contract') || type.includes('temporary') || type.includes('freelance')) {
      return JOB_TYPES.CONTRACT;
    }
    if (type.includes('part') || type.includes('part-time')) {
      return JOB_TYPES.PART_TIME;
    }
    if (type.includes('full') || type.includes('permanent')) {
      return JOB_TYPES.FULL_TIME;
    }

    return JOB_TYPES.UNKNOWN;  // Use unknown for unrecognized types
  }

  private static normalizeExperience(experience: string): string {
    // Handle different experience formats
    const exp = experience.toLowerCase().trim();
    
    // Convert "0-1 years" to "Fresh"
    if (exp.startsWith('0') || exp.includes('fresher')) {
      return 'Fresh';
    }

    // Convert "5-7 years" to "5+"
    const years = exp.match(/\d+/);
    if (years) {
      const minYears = parseInt(years[0]);
      return `${minYears}+`;
    }

    return experience;  // return as is if no conversion needed
  }

  static toReceivedDTO(job: JobDTO): ReceivedJobDTO {
    return {
      ...(job.id && { id: job.id }),
      title: job.title,
      company: job.company,
      job_type: job.job_type,
      experience: job.experience,
      description: job.description,
      application_link: job.application_link,
      source: job.source,
      posted_date: job.posted_date.toISOString(),
    };
  }
} 