import { useEffect, useState } from 'react';
import { getAllTeams } from '../../api/team.api';
import { Team } from '../../types';

const TeamList = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllTeams()
      .then(res => setTeams(res.data.teams))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div className="flex flex-col gap-4">
      {teams.length === 0 && (
        <p className="text-center text-gray-400 py-10">No teams found.</p>
      )}
      {teams.map(team => (
        <div
          key={team.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white shadow-sm"
        >
          <div className="flex items-center gap-4">
            <img
              src={team.image ? `http://localhost:4000/${team.image}` : 'https://via.placeholder.com/80'}
              alt={team.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <p className="text-sm mb-1">Name: <strong>{team.name}</strong></p>
              <p className="text-sm mb-1">Email: <strong>{team.email}</strong></p>
              <p className="text-sm">Position: <strong>{team.position}</strong></p>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-600 transition">
            ✏️
          </button>
        </div>
      ))}
    </div>
  );
};

export default TeamList;