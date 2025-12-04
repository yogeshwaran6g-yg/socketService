import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchGames, fetchFixedWinnersSettings, updateFixedWinnerSetting, toggleFixedWinnerSetting } from "../utils/api";

const FixedWinnerDashboard = () => {
  const [games, setGames] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Fetch data on load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [gamesData, settingsData] = await Promise.all([
          fetchGames(),
          fetchFixedWinnersSettings()
        ]);

        setGames(gamesData || []);

        // Merge games with settings. If a game has no setting, create a default one.
        const mergedSettings = (gamesData || []).map(game => {
          const existing = (settingsData || []).find(s => s.game_name === game);
          return existing || {
            game_name: game,
            fixed_clan: "",
            enabled: false,
            total_match: 0,
            completed_match: 0
          };
        });

        setSettings(mergedSettings);
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEdit = (setting) => {
    setEditingId(setting.game_name);
    setEditForm({ ...setting });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateFixedWinnerSetting(editForm);

      setSettings(prev => prev.map(s =>
        s.game_name === editForm.game_name ? { ...editForm, updated_at: new Date().toISOString() } : s
      ));

      setEditingId(null);
      toast.success("Settings saved");
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  const handleToggle = async (gameName, currentStatus) => {
    try {
      await toggleFixedWinnerSetting({ game_name: gameName, enabled: !currentStatus });

      setSettings(prev => prev.map(s =>
        s.game_name === gameName ? { ...s, enabled: !currentStatus } : s
      ));

      toast.success(`Fixed winner ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error("Failed to toggle setting");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto text-black">
      <h2 className="text-2xl font-bold mb-6">Fixed Winner Settings</h2>

      <div className="grid gap-6">
        {settings.map((setting) => {
          const isEditing = editingId === setting.game_name;
          const data = isEditing ? editForm : setting;
          const remaining = (data.total_match || 0) - (data.completed_match || 0);

          return (
            <div key={setting.game_name} className="bg-white p-4 rounded shadow border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{setting.game_name}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Enable</span>
                    <button
                      onClick={() => handleToggle(setting.game_name, setting.enabled)}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition ${setting.enabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`bg-white w-4 h-4 rounded-full shadow transition transform ${setting.enabled ? "translate-x-6" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => handleEdit(setting)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fixed Clan</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.fixed_clan || ""}
                      onChange={(e) => handleChange("fixed_clan", e.target.value)}
                      className="w-full border p-2 rounded text-sm"
                      placeholder="Clan Name"
                    />
                  ) : (
                    <div className="text-sm font-medium">{data.fixed_clan || "-"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Total Matches</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={data.total_match || 0}
                      onChange={(e) => handleChange("total_match", Number(e.target.value))}
                      className="w-full border p-2 rounded text-sm"
                    />
                  ) : (
                    <div className="text-sm font-medium">{data.total_match || 0}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Completed</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={data.completed_match || 0}
                      onChange={(e) => handleChange("completed_match", Number(e.target.value))}
                      className="w-full border p-2 rounded text-sm"
                    />
                  ) : (
                    <div className="text-sm font-medium">{data.completed_match || 0}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Remaining</label>
                  <div className="text-sm font-medium">{remaining}</div>
                </div>
              </div>
            </div>
          );
        })}

        {settings.length === 0 && (
          <div className="text-center text-gray-500 py-10">No games found</div>
        )}
      </div>
    </div>
  );
};

export default FixedWinnerDashboard;
