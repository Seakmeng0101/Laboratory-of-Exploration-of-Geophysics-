import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById } from '../api/project.api';
import { Project } from '../types';

const parseDescription = (desc: string[]): string[] => {
  try {
    if (!desc || desc.length === 0) return [];
    const first = desc[0];
    if (typeof first === 'string' && first.startsWith('[')) return JSON.parse(first);
    return desc;
  } catch {
    return desc;
  }
};

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProjectById(id)
      .then((res) => setProject(res.data.project ?? res.data))
      .catch((err) => console.log('error loading project:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="w-full px-6 py-16 animate-pulse">
        <div className="h-80 bg-gray-100 rounded-xl mb-6" />
        <div className="h-6 w-2/3 bg-gray-100 rounded-full mb-3" />
        <div className="h-4 w-1/3 bg-gray-100 rounded-full mb-6" />
        <div className="h-4 w-full bg-gray-100 rounded-full mb-2" />
        <div className="h-4 w-full bg-gray-100 rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full px-6 py-16 text-center">
        <p className="text-gray-400 mb-4">Project not found.</p>
        <Link to="/projects" className="text-cyan-600 text-sm font-medium">
          Back to all projects
        </Link>
      </div>
    );
  }

  const bullets = parseDescription(project.description);
  const imgs = project.images || [];

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="w-full px-6 py-12">
        <Link to="/projects" className="text-sm text-cyan-600 mb-6 inline-block">
          Back to all projects
        </Link>

        {imgs.length > 0 && (
          <div
            className={`grid gap-1 mb-8 ${
              imgs.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {imgs.slice(0, 4).map((src, i) => (
              <img
                key={i}
                src={'http://localhost:4000/' + src}
                alt={project.title + '-' + i}
                className="w-full h-64 sm:h-72 md:h-80 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{project.title.trim()}</h1>
        <p className="text-cyan-600 mb-6">{project.company_title}</p>

        <ul className="space-y-2 mb-6">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-800 mt-2 flex-shrink-0" />
              <span>{b.trim()}</span>
            </li>
          ))}
        </ul>

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-cyan-600 font-medium"
          >
            View project
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;