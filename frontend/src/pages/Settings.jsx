import { useEffect, useState } from "react";

import {
  getChannels,
  updateChannel,
} from "../services/api";


function Settings() {

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");


  const loadChannels = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getChannels();

      setChannels(data);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to load notification channels."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadChannels();
  }, []);


  const handleToggle = async (
    channelId,
    currentStatus
  ) => {

    try {

      setUpdatingId(channelId);
      setError("");

      const updatedChannel =
        await updateChannel(
          channelId,
          !currentStatus
        );


      setChannels((currentChannels) =>
        currentChannels.map((channel) =>
          channel.id === channelId
            ? updatedChannel
            : channel
        )
      );

    } catch (err) {

      console.error(err);

      setError(
        "Unable to update channel status."
      );

    } finally {

      setUpdatingId(null);

    }
  };


  return (
    <div className="settings-page">

      <div className="page-header">

        <div>
          <h1>Settings</h1>

          <p>
            Manage notification channels and
            delivery settings.
          </p>
        </div>

      </div>


      {error && (
        <div className="settings-error">
          {error}
        </div>
      )}


      <div className="settings-section">

        <div className="section-header">

          <div>
            <h2>Notification Channels</h2>

            <p>
              Enable or disable notification
              delivery channels globally.
            </p>
          </div>

        </div>


        {loading ? (

          <div className="settings-loading">
            Loading channels...
          </div>

        ) : (

          <div className="channel-list">

            {channels.map((channel) => (

              <div
                className="channel-card"
                key={channel.id}
              >

                <div className="channel-info">

                  <div className="channel-icon">
                    {channel.channel_key ===
                    "email"
                      ? "✉"
                      : channel.channel_key ===
                        "whatsapp"
                      ? "◉"
                      : "◌"}
                  </div>


                  <div>

                    <h3>
                      {channel.name}
                    </h3>

                    <p>
                      {channel.description}
                    </p>

                    <span
                      className={
                        channel.enabled
                          ? "channel-status enabled"
                          : "channel-status disabled"
                      }
                    >
                      {channel.enabled
                        ? "Enabled"
                        : "Disabled"}
                    </span>

                  </div>

                </div>


                <button
                  type="button"
                  className={
                    channel.enabled
                      ? "toggle active"
                      : "toggle"
                  }
                  disabled={
                    updatingId === channel.id
                  }
                  onClick={() =>
                    handleToggle(
                      channel.id,
                      channel.enabled
                    )
                  }
                  aria-label={
                    `Toggle ${channel.name}`
                  }
                >

                  <span className="toggle-circle" />

                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}


export default Settings;