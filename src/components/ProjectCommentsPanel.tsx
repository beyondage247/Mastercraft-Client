import { type FormEvent, useEffect, useState } from "react";
import type { ProjectCommentItem, ProjectListItem } from "../data/portal";
import { addProjectComment } from "../services/portalApi";
import { showRequestToast } from "../utils/portalToast";

type ProjectCommentsPanelProps = {
  onProjectUpdated?: (project: ProjectListItem) => void;
  project: ProjectListItem;
};

function ProjectCommentsPanel({ project }: ProjectCommentsPanelProps) {
  const [comments, setComments] = useState<ProjectCommentItem[]>(project.comments ?? []);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setComments(project.comments ?? []);
  }, [project]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      showRequestToast("project-comment-validation", "Checking comment...").error("Enter a comment before sending.");
      return;
    }

    const toast = showRequestToast("project-comment", "Sending comment...");
    setIsSending(true);

    try {
      const comment = await addProjectComment(project.id, trimmedMessage);
      setComments((current) => [...current, comment]);
      setMessage("");
      toast.success("Comment sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send comment.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="project-comments-panel">
      <div className="project-comments-list">
        {comments.length ? (
          comments.map((comment) => (
            <article className="project-comment" key={comment.id}>
              <div>
                <strong>{comment.user.name}</strong>
                <span>{comment.user.role} • {comment.createdAt || "Just now"}</span>
              </div>
              <p>{comment.message}</p>
            </article>
          ))
        ) : (
          <div className="admin-empty-row">No comments yet. Start the project conversation here.</div>
        )}
      </div>

      <form className="project-comment-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={`projectComment-${project.id}`}>Comment</label>
          <textarea
            id={`projectComment-${project.id}`}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write a message about this project"
            rows={4}
            value={message}
          />
        </div>
        <div className="admin-form-actions">
          <button className="primary-action" disabled={isSending} type="submit">
            <span>{isSending ? "Sending..." : "Send comment"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectCommentsPanel;
