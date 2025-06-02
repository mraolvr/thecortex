import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Users, Globe, FileText } from 'lucide-react';
import WritingList from './writing/WritingList';
import WritingForm from './writing/WritingForm';
import CharacterList from './writing/CharacterList';
import WorldBuildingList from './writing/WorldBuildingList';
import useCreativeHubStore from '../../stores/creativeHubStore';

export default function WritingSection() {
  const [showWritingForm, setShowWritingForm] = useState(false);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'characters', or 'world'
  const [selectedProject, setSelectedProject] = useState(null);
  
  const { 
    writingProjects, 
    characters, 
    worldBuilding,
    initializeWriting,
    isLoadingWriting,
    writingError 
  } = useCreativeHubStore();

  useEffect(() => {
    initializeWriting();
  }, [initializeWriting]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowWritingForm(true);
  };

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => {
            setSelectedProject(null);
            setShowWritingForm(true);
          }}
          className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-surface-light/20">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center space-x-2 px-4 py-2 ${
            activeTab === 'projects'
              ? 'text-primary border-b-2 border-primary'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Projects</span>
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          className={`flex items-center space-x-2 px-4 py-2 ${
            activeTab === 'characters'
              ? 'text-primary border-b-2 border-primary'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Characters</span>
        </button>
        <button
          onClick={() => setActiveTab('world')}
          className={`flex items-center space-x-2 px-4 py-2 ${
            activeTab === 'world'
              ? 'text-primary border-b-2 border-primary'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span>World Building</span>
        </button>
      </div>

      {/* Content */}
      <div className="mt-8">
        {isLoadingWriting ? (
          <div className="text-center p-8 text-neutral-400">Loading...</div>
        ) : writingError ? (
          <div className="text-center p-8 text-red-400">{writingError}</div>
        ) : (
          <>
            {activeTab === 'projects' && (
              <WritingList
                projects={writingProjects}
                onSelect={handleProjectSelect}
                onEdit={handleEditProject}
              />
            )}
            {activeTab === 'characters' && <CharacterList />}
            {activeTab === 'world' && <WorldBuildingList />}
          </>
        )}
      </div>

      {/* Forms */}
      {showWritingForm && (
        <WritingForm
          onClose={() => {
            setShowWritingForm(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
        />
      )}
    </div>
  );
} 