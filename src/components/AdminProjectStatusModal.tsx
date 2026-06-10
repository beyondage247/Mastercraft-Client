import { DatePicker, Modal } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import type { ProjectListItem, ProjectStageItem, ProjectStageType } from "../data/portal";
import {
  calculateFabricationProgress,
  calculateStageProgress,
  updateProjectStatus,
  type ProjectStageInput,
} from "../services/portalApi";
import { PORTAL_DATE_FORMAT } from "../utils/dateFormat";
import { showRequestToast } from "../utils/portalToast";

type ProjectStageKey = "mil" | "buildAssemble" | "finishing" | "delivery" | "install";

type StageFormState = {
  hoursBudgeted: string;
  hoursSpent: string;
  startDate: string;
};

type ProjectStatusFormState = {
  buildAssemble: StageFormState;
  delivery: StageFormState;
  finishing: StageFormState;
  install: StageFormState;
  mil: StageFormState;
};

const stageFields: Array<{ key: ProjectStageKey; label: string; stage: ProjectStageType }> = [
  { key: "mil", label: "MIL", stage: "MIL" },
  { key: "buildAssemble", label: "Build/Assemble", stage: "BUILD_ASSEMBLE" },
  { key: "finishing", label: "Finishing", stage: "FINISHING" },
  { key: "delivery", label: "Delivery", stage: "DELIVERY" },
  { key: "install", label: "Install", stage: "INSTALL" },
];

function portalDateValue(value: string) {
  if (!value) {
    return null;
  }

  const oldPortalDate = value.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  const portalDate = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (oldPortalDate) {
    return dayjs(`${oldPortalDate[1]}-${oldPortalDate[3]}-${oldPortalDate[2]}`);
  }

  if (portalDate) {
    return dayjs(`${portalDate[3]}-${portalDate[1]}-${portalDate[2]}`);
  }

  return dayjs(value);
}

function portalDateText(date: dayjs.Dayjs | null) {
  return date ? date.format(PORTAL_DATE_FORMAT) : "";
}

function emptyStage(project?: ProjectListItem): StageFormState {
  return {
    hoursBudgeted: "",
    hoursSpent: "0",
    startDate: project?.startDateValue || "",
  };
}

function stageForm(project: ProjectListItem | null, stageType: ProjectStageType): StageFormState {
  const stage = project?.stages?.find((item) => item.stage === stageType);

  if (!stage) {
    return emptyStage(project ?? undefined);
  }

  return {
    hoursBudgeted: String(stage.hoursBudgeted || ""),
    hoursSpent: String(stage.hoursSpent || 0),
    startDate: stage.startDateValue || project?.startDateValue || "",
  };
}

function formFromProject(project: ProjectListItem | null): ProjectStatusFormState {
  return {
    buildAssemble: stageForm(project, "BUILD_ASSEMBLE"),
    delivery: stageForm(project, "DELIVERY"),
    finishing: stageForm(project, "FINISHING"),
    install: stageForm(project, "INSTALL"),
    mil: stageForm(project, "MIL"),
  };
}

function numberValue(value: string) {
  return Number(value) || 0;
}

function toStageInput(stage: StageFormState): ProjectStageInput {
  return {
    hoursBudgeted: numberValue(stage.hoursBudgeted),
    hoursSpent: numberValue(stage.hoursSpent),
    startDate: stage.startDate,
  };
}

function toProgressStage(stage: StageFormState): Pick<ProjectStageItem, "hoursBudgeted" | "hoursSpent" | "progress"> {
  const hoursBudgeted = numberValue(stage.hoursBudgeted);
  const hoursSpent = numberValue(stage.hoursSpent);

  return {
    hoursBudgeted,
    hoursSpent,
    progress: calculateStageProgress(hoursBudgeted, hoursSpent),
  };
}

type AdminProjectStatusModalProps = {
  onClose: () => void;
  onSaved: (project: ProjectListItem) => void;
  open: boolean;
  project: ProjectListItem | null;
};

function AdminProjectStatusModal({ onClose, onSaved, open, project }: AdminProjectStatusModalProps) {
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState<ProjectStatusFormState>(() => formFromProject(project));
  const [isSaving, setIsSaving] = useState(false);
  const [markCompleted, setMarkCompleted] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(formFromProject(project));
      setFeedback("");
      setMarkCompleted(false);
    }
  }, [open, project]);

  const fabricationProgress = useMemo(
    () =>
      calculateFabricationProgress({
        buildAssemble: toProgressStage(form.buildAssemble),
        finishing: toProgressStage(form.finishing),
        mil: toProgressStage(form.mil),
      }),
    [form],
  );

  function updateStage(stage: ProjectStageKey, field: keyof StageFormState, value: string) {
    setForm((current) => ({
      ...current,
      [stage]: {
        ...current[stage],
        [field]: value,
      },
    }));
  }

  function stageProgress(stage: ProjectStageKey) {
    return calculateStageProgress(
      numberValue(form[stage].hoursBudgeted),
      numberValue(form[stage].hoursSpent),
    );
  }

  async function handleSave() {
    if (!project) {
      return;
    }

    const missingStageValue = stageFields.some(({ key }) => {
      const stage = form[key];

      return !numberValue(stage.hoursBudgeted) || !stage.startDate;
    });

    if (missingStageValue) {
      setFeedback("Budgeted hours and start date are required for every stage.");
      return;
    }

    const toast = showRequestToast("update-project-status", "Updating project...");

    try {
      setIsSaving(true);
      const updatedProject = await updateProjectStatus(project.id, {
        buildAssemble: toStageInput(form.buildAssemble),
        delivery: toStageInput(form.delivery),
        finishing: toStageInput(form.finishing),
        install: toStageInput(form.install),
        mil: toStageInput(form.mil),
        ...(markCompleted && project.status === "In Production" ? { status: "Completed" as const } : {}),
      });

      onSaved(updatedProject);
      toast.success(`${updatedProject.title} was updated.`);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update project.";

      setFeedback(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal maskClosable={false}
      okButtonProps={{ loading: isSaving }}
      okText="Save changes"
      onCancel={onClose}
      onOk={handleSave}
      open={open}
      title={`Edit${project ? ` ${project.title}` : " project"}`}
      width={900}
    >
      <div className="admin-modal-form">
        <div className="form-row">
          {project?.status === "In Production" ? (
            <label className="admin-complete-toggle">
              <input
                checked={markCompleted}
                onChange={(event) => setMarkCompleted(event.target.checked)}
                type="checkbox"
              />
              <span>Mark project as completed</span>
            </label>
          ) : null}
          <div className="admin-stage-summary">
            <span>Fabrication</span>
            <strong>{fabricationProgress}%</strong>
          </div>
        </div>

        <div className="admin-stage-grid">
          {stageFields.map((stage) => (
            <fieldset key={stage.key}>
              <legend>{stage.label}</legend>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`${stage.key}EditBudgeted`}>Hours budgeted</label>
                  <input
                    id={`${stage.key}EditBudgeted`}
                    min="0"
                    onChange={(event) => updateStage(stage.key, "hoursBudgeted", event.target.value)}
                    type="number"
                    value={form[stage.key].hoursBudgeted}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`${stage.key}EditSpent`}>Hours spent</label>
                  <input
                    id={`${stage.key}EditSpent`}
                    min="0"
                    onChange={(event) => updateStage(stage.key, "hoursSpent", event.target.value)}
                    type="number"
                    value={form[stage.key].hoursSpent}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`${stage.key}EditStart`}>Stage start</label>
                  <DatePicker
                    format={PORTAL_DATE_FORMAT}
                    id={`${stage.key}EditStart`}
                    onChange={(date) => updateStage(stage.key, "startDate", portalDateText(date))}
                    value={portalDateValue(form[stage.key].startDate)}
                  />
                </div>
                <div className="form-group">
                  <label>Progress</label>
                  <input readOnly type="text" value={`${stageProgress(stage.key)}%`} />
                </div>
              </div>
            </fieldset>
          ))}
        </div>

        {feedback ? (
          <p className="admin-feedback" aria-live="polite">
            {feedback}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

export default AdminProjectStatusModal;
