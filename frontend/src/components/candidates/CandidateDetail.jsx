import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, EnvelopeIcon, PhoneIcon, LinkIcon } from '@heroicons/react/24/outline';
import { useCandidate } from '../../hooks/useCandidates';
import { useAuth } from '../../context/AuthContext';
import VideoPlayer from '../video/VideoPlayer';
import CVAnalysis from '../cv/CVAnalysis';
import ReviewForm from '../reviews/ReviewForm';
import ReviewDisplay from '../reviews/ReviewDisplay';

export default function CandidateDetail({ candidateId, isOpen, onClose }) {
  const { candidate, loading, error, refetch } = useCandidate(candidateId);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('video');

  useEffect(() => {
    if (isOpen && candidateId) {
      refetch();
    }
  }, [isOpen, candidateId]);

  const myReview = candidate?.reviews?.find(r => r.reviewer_email === user?.email);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-3xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="bg-indigo-700 px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          {loading ? (
                            <div className="h-8 w-48 bg-indigo-600 rounded animate-pulse" />
                          ) : (
                            <>
                              <Dialog.Title className="text-xl font-semibold text-white">
                                {candidate?.name}
                              </Dialog.Title>
                              <p className="mt-1 text-indigo-200">{candidate?.role}</p>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          className="rounded-md text-indigo-200 hover:text-white focus:outline-none"
                          onClick={onClose}
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                      </div>
                    ) : error ? (
                      <div className="flex-1 flex items-center justify-center text-red-600">
                        {error}
                      </div>
                    ) : candidate ? (
                      <div className="flex-1 px-6 py-4 space-y-6">
                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {candidate.email && (
                            <a href={`mailto:${candidate.email}`} className="flex items-center hover:text-indigo-600">
                              <EnvelopeIcon className="h-4 w-4 mr-1" />
                              {candidate.email}
                            </a>
                          )}
                          {candidate.phone && (
                            <span className="flex items-center">
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              {candidate.phone}
                            </span>
                          )}
                          {candidate.linkedin_url && (
                            <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-indigo-600">
                              <LinkIcon className="h-4 w-4 mr-1" />
                              LinkedIn
                            </a>
                          )}
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                          <nav className="-mb-px flex space-x-8">
                            {['video', 'cv', 'reviews'].map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                                  activeTab === tab
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                              >
                                {tab === 'cv' ? 'CV Analysis' : tab}
                              </button>
                            ))}
                          </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                          {activeTab === 'video' && (
                            <VideoPlayer videoInfo={candidate.videoInfo} />
                          )}

                          {activeTab === 'cv' && (
                            <CVAnalysis candidate={candidate} onUpdate={refetch} />
                          )}

                          {activeTab === 'reviews' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                  Your Review
                                </h3>
                                {user ? (
                                  <ReviewForm
                                    candidateId={candidate.id}
                                    existingReview={myReview}
                                    onSaved={refetch}
                                  />
                                ) : (
                                  <p className="text-gray-500">Sign in to submit a review</p>
                                )}
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                  All Reviews
                                </h3>
                                <ReviewDisplay
                                  reviews={candidate.reviews}
                                  consensus={candidate.consensus}
                                  currentUserEmail={user?.email}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Submitted Date */}
                        <div className="text-xs text-gray-400 pt-4 border-t">
                          Submitted: {new Date(candidate.submitted_at).toLocaleString()}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
