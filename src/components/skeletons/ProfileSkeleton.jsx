import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProfileSkeleton = () => {
  return (
    <div className="card bg-white border-0 shadow-sm">
      <div className="card-body p-0">
        {/* My Profile Header */}
        <h2 className="">
          <Skeleton width={150} height={20} />
        </h2 >

        {/* Personal Details Section */}
        <div className="mb-4">

          {/* Upload Image Section */}
          <div className="mb-3">
            <div className="d-flex flex-wrap align-items-end gap-3">
              {/* Image Upload Box */}
              <div>
                <Skeleton width={120} borderRadius={8} height={120} />
              </div>
              
              {/* Upload Text */}
              <div className="flex-grow-1 ">
                <Skeleton width={170} height={45} borderRadius={50} className="mb-2" />
                <Skeleton width={300} height={12} />
              </div>
            </div>
          </div>
        </div>
        <hr className='mt-0' />

        {/* Form Fields */}
        <div className="row g-4">
          {/* Full Name */}
          <div className="col-md-6">
            <Skeleton width={80} height={15} className="mb-2" />
            <Skeleton height={42} />
          </div>

          {/* Email */}
          <div className="col-md-6">
            <Skeleton width={60} height={15} className="mb-2" />
            <Skeleton height={42} />
          </div>

          {/* Phone Number */}
          <div className="col-md-6">
            <Skeleton width={100} height={15} className="mb-2" />
            <Skeleton height={42} />
          </div>

          {/* Gender */}
          <div className="col-md-6">
            <Skeleton width={70} height={15} className="mb-2" />
            <Skeleton height={42} />
          </div>

          {/* Date of Birth */}
          <div className="col-md-6">
            <Skeleton width={90} height={15} className="mb-2" />
            <Skeleton height={42} />
          </div>

          {/* University */}
          <div className="col-md-6">
            <Skeleton width={80} height={15} className="mb-2" />
            <Skeleton height={42} />
          </div>

          {/* Graduation Year */}
          <div className="col-md-6">
            <Skeleton width={110} height={15} className="mb-2" />
            <Skeleton height={42} />
          </div>

          {/* Course */}
          <div className="col-md-6">
            <Skeleton width={70} height={15} className="mb-2" />
            <Skeleton height={42} />
          </div>

          {/* Address - Full Width */}
          <div className="col-12">
            <Skeleton width={70} height={15} className="mb-2" />
            <Skeleton height={42} />
          </div>

          {/* About Me - Full Width */}
          <div className="col-12">
            <Skeleton width={80} height={15} className="mb-2" />
            <Skeleton height={80} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;