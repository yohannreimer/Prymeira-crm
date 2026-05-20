// FIXME: This should be exported from the ra-core package
type CanAccessParams<
  RecordType extends Record<string, any> = Record<string, any>,
> = {
  action: string;
  resource: string;
  record?: RecordType;
};

export const canAccess = <
  RecordType extends Record<string, any> = Record<string, any>,
>(
  role: string,
  params: CanAccessParams<RecordType>,
) => {
  if (role === "admin") {
    return true;
  }

  // Non admins can't access the sales resource
  if (params.resource === "sales") {
    return false;
  }

  // Non admins can't access the configuration resource
  if (params.resource === "configuration") {
    return false;
  }

  // Non admins can't manage automation rules
  if (params.resource === "automation_rules") {
    return false;
  }

  // Non admins can't manage proposal templates
  if (
    params.resource === "proposal_templates" ||
    params.resource === "proposal_template_items"
  ) {
    return false;
  }

  // Non admins can't manage sales goals
  if (params.resource === "sales_goals") {
    return false;
  }

  return true;
};
