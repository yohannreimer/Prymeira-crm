export const englishCrmMessages = {
  resources: {
    companies: {
      name: "Company |||| Companies",
      forcedCaseName: "Company",
      fields: {
        name: "Company name",
        website: "Website",
        linkedin_url: "LinkedIn URL",
        phone_number: "Phone number",
        created_at: "Created at",
        nb_contacts: "Number of contacts",
        revenue: "Revenue",
        sector: "Sector",
        size: "Size",
        tax_identifier: "Tax Identifier",
        address: "Address",
        city: "City",
        zipcode: "Zip code",
        state_abbr: "State",
        country: "Country",
        description: "Description",
        context_links: "Context links",
        sales_id: "Account manager",
      },
      empty: {
        description: "It seems your company list is empty.",
        title: "No companies found",
      },
      field_categories: {
        contact: "Contact",
        additional_info: "Additional information",
        address: "Address",
        context: "Context",
      },
      action: {
        create: "Create Company",
        edit: "Edit company",
        new: "New Company",
        show: "Show company",
      },
      added_on: "Added on %{date}",
      followed_by: "Followed by %{name}",
      followed_by_you: "Followed by you",
      no_contacts: "No contact",
      nb_contacts: "%{smart_count} contact |||| %{smart_count} contacts",
      nb_deals: "%{smart_count} deal |||| %{smart_count} deals",
      sizes: {
        one_employee: "1 employee",
        two_to_nine_employees: "2-9 employees",
        ten_to_forty_nine_employees: "10-49 employees",
        fifty_to_two_hundred_forty_nine_employees: "50-249 employees",
        two_hundred_fifty_or_more_employees: "250 or more employees",
      },
      autocomplete: {
        create_error: "An error occurred while creating the company",
        create_item: "Create %{item}",
        create_label: "Start typing to create a new company",
      },
      filters: {
        only_mine: "Only companies I manage",
      },
    },
    pipelines: {
      name: "Pipeline |||| Pipelines",
    },
    contacts: {
      name: "Contact |||| Contacts",
      forcedCaseName: "Contact",
      field_categories: {
        background_info: "Background info",
        identity: "Identity",
        misc: "Misc",
        personal_info: "Personal info",
        position: "Position",
      },
      fields: {
        first_name: "First name",
        last_name: "Last name",
        last_seen: "Last seen",
        title: "Title",
        company_id: "Company",
        email_jsonb: "Email addresses",
        email: "Email",
        phone_jsonb: "Phone numbers",
        phone_number: "Phone number",
        linkedin_url: "LinkedIn URL",
        background: "Background info (bio, how you met, etc)",
        has_newsletter: "Has newsletter",
        sales_id: "Account manager",
      },
      action: {
        add: "Add contact",
        add_first: "Add your first contact",
        create: "Create contact",
        edit: "Edit contact",
        export_vcard: "Export to vCard",
        new: "New Contact",
        show: "Show contact",
      },
      background: {
        last_activity_on: "Last activity on %{date}",
        added_on: "Added on %{date}",
        followed_by: "Followed by %{name}",
        followed_by_you: "Followed by you",
        status_none: "None",
      },
      position_at: "%{title} at",
      position_at_company: "%{title} at %{company}",
      empty: {
        description: "It seems your contact list is empty.",
        title: "No contacts found",
      },
      import: {
        title: "Import contacts",
        button: "Import CSV",
        complete:
          "Contacts import complete. Imported %{importCount} contacts, with %{errorCount} errors",
        progress:
          "Imported %{importCount} / %{rowCount} contacts, with %{errorCount} errors.",
        error:
          "Failed to import this file, please make sure your provided a valid CSV file.",
        imported: "Imported",
        remaining_time: "Estimated remaining time:",
        running: "The import is running, please do not close this tab.",
        sample_download: "Download CSV sample",
        sample_hint: "Here is a sample CSV file you can use as a template",
        stop: "Stop import",
        csv_file: "CSV File",
        contacts_label: "contact |||| contacts",
      },
      inputs: {
        genders: {
          male: "He/Him",
          female: "She/Her",
          nonbinary: "They/Them",
        },
        personal_info_types: {
          work: "Work",
          home: "Home",
          other: "Other",
        },
      },
      list: {
        error_loading: "Error loading contacts",
      },
      bulk_tag: {
        action: "Tag",
        back: "Back to tags",
        create_description:
          "Create a new tag and apply it to the selected contacts.",
        description:
          "Choose an existing tag or create a new one for the selected contacts.",
        empty: "No tags yet. Create one to tag the selected contacts.",
        error: "Failed to add tag to contacts",
        noop: "Selected contacts already have this tag",
        success:
          "Tag added to %{smart_count} contact |||| Tag added to %{smart_count} contacts",
        title: "Add tag to contacts",
      },
      merge: {
        action: "Merge with another contact",
        confirm: "Merge Contacts",
        current_contact: "Current Contact (will be deleted)",
        description: "Merge this contact with another one.",
        error: "Failed to merge contacts",
        merging: "Merging...",
        no_additional_data: "No additional data to merge",
        select_target: "Please select a contact to merge with",
        success: "Contacts merged successfully",
        target_contact: "Target Contact (will be kept)",
        title: "Merge Contact",
        warning_description:
          "All data will be transferred to the second contact. This action cannot be undone.",
        warning_title: "Warning: Destructive Operation",
        what_will_be_merged: "What will be merged:",
      },
      filters: {
        before_last_month: "Before last month",
        before_this_month: "Before this month",
        before_this_week: "Before this week",
        managed_by_me: "Managed by me",
        search: "Search name, company...",
        this_week: "This week",
        today: "Today",
        tags: "Tags",
        tasks: "Tasks",
      },
      hot: {
        empty_change_status:
          'Change the status of a contact by adding a note to that contact and clicking on "show options".',
        empty_hint: 'Contacts with a "hot" status will appear here.',
        title: "Hot Contacts",
      },
    },
    agenda: {
      name: "Agenda |||| Agenda",
      subtitle: "Daily commercial priorities",
      empty: "Nothing pending in this section",
      sections: {
        overdue: "Overdue",
        today: "Today",
        risks: "Risks",
        upcoming: "Upcoming",
      },
      kinds: {
        task: "Task",
        lead: "Lead",
        deal: "Deal",
        proposal: "Proposal",
      },
      states: {
        overdue: "Overdue",
        today: "Today",
        upcoming: "Upcoming",
        "missing-next-action": "No next action",
        stale: "Stale",
      },
    },
    leads: {
      name: "Lead |||| Leads",
      forcedCaseName: "Lead",
      fields: {
        first_name: "First name",
        last_name: "Last name",
        email: "Email",
        phone_number: "Phone number",
        company_name: "Company",
        source: "Source",
        interest: "Interest",
        temperature: "Temperature",
        status: "Status",
        next_action_at: "Next action",
        discard_reason: "Discard reason",
        converted_at: "Converted at",
        discarded_at: "Discarded at",
        sales_id: "Owner",
        created_at: "Created at",
        updated_at: "Updated at",
      },
      field_categories: {
        qualification: "Qualification",
        follow_up: "Follow-up",
      },
      statuses: {
        new: "New",
        contacted: "Contacted",
        qualified: "Qualified",
        converted: "Converted",
        discarded: "Discarded",
      },
      temperatures: {
        cold: "Cold",
        warm: "Warm",
        hot: "Hot",
      },
      action: {
        create: "Create lead",
        new: "New Lead",
      },
      convert: {
        action: "Convert",
        converting: "Converting...",
        success: "Lead converted into company, contact, and deal",
        error: "Failed to convert lead",
      },
      empty: {
        title: "No leads found",
        description:
          "Capture leads before turning qualified opportunities into deals.",
        filtered: "No leads found with the current filters.",
      },
    },
    deals: {
      name: "Deal |||| Deals",
      fields: {
        name: "Name",
        description: "Description",
        company_id: "Company",
        contact_ids: "Contacts",
        category: "Category",
        deal_type: "Deal type",
        amount: "Budget",
        probability: "Probability",
        expected_closing_date: "Expected closing date",
        next_action_at: "Next action",
        source: "Source",
        stage: "Stage",
        lost_reason: "Lost reason",
        last_activity_at: "Last activity",
        weighted_amount: "Weighted value",
      },
      weighted_short: "Weighted",
      weighted_short_compact: "W",
      kanban: {
        add_column: "+ Column",
        edit_playbook: "Edit stage playbook",
        empty_column: "No deals in this column",
        new_column_placeholder: "Column name...",
        remove_column: "Remove column",
      },
      risk: {
        no_next_action: "No next action",
        stale: "Stale",
      },
      action: {
        back_to_deal: "Back to deal",
        create: "Create deal",
        new: "New Deal",
      },
      field_categories: {
        misc: "Misc",
      },
      archived: {
        action: "Archive",
        error: "Error: deal not archived",
        list_title: "Archived Deals",
        success: "Deal archived",
        title: "Archived Deal",
        view: "View archived deals",
      },
      inputs: {
        linked_to: "Linked to",
      },
      unarchived: {
        action: "Send back to the board",
        error: "Error: deal not unarchived",
        success: "Deal unarchived",
      },
      updated: "Deal updated",
      empty: {
        before_create: "before creating a deal.",
        description: "It seems your deal list is empty.",
        title: "No deals found",
      },
      invalid_date: "Invalid date",
    },
    proposals: {
      name: "Proposal |||| Proposals",
      forcedCaseName: "Proposal",
      fields: {
        deal_id: "Deal",
        company_id: "Company",
        contact_id: "Contact",
        sales_id: "Owner",
        template_id: "Template",
        internal_notes: "Internal notes",
        number: "Number",
        title: "Title",
        status: "Status",
        scope: "Scope",
        terms: "Commercial terms",
        delivery_time: "Delivery time",
        payment_terms: "Payment terms",
        currency: "Currency",
        subtotal: "Subtotal",
        discount_amount: "Discount",
        tax_amount: "Taxes and adjustments",
        total: "Total",
        valid_until: "Valid until",
        sent_at: "Sent at",
        accepted_at: "Accepted at",
        rejected_at: "Rejected at",
        created_at: "Created at",
        updated_at: "Updated at",
        items: "Items",
      },
      field_categories: {
        linked_to: "Linked to",
        commercial: "Commercial",
      },
      statuses: {
        draft: "Draft",
        sent: "Sent",
        accepted: "Accepted",
        rejected: "Rejected",
        expired: "Expired",
      },
      action: {
        create: "Create proposal",
        duplicate: "Duplicate",
        edit: "Edit proposal",
        export_pdf: "Export PDF",
        generate: "Generate proposal",
        new: "New proposal",
        print: "Print",
        view: "View",
        show: "Show proposal",
      },
      create: {
        error: "Failed to create proposal",
      },
      edit: {
        error: "Failed to update proposal",
      },
      empty: {
        description: "It seems your proposal list is empty.",
        filtered: "No proposals found with the current filters.",
        for_deal: "No proposal for this deal.",
        title: "No proposals found",
      },
      empty_items: "No items yet",
      notifications: {
        duplicate_error: "Could not duplicate the proposal",
        duplicated: "Proposal duplicated",
        print_blocked: "The browser blocked the print window",
      },
      print: {
        client_acceptance: "Client acceptance",
        seller_signature: "Sales representative",
      },
    },
    proposal_items: {
      name: "Proposal item |||| Proposal items",
      fields: {
        description: "Description",
        quantity: "Quantity",
        unit_price: "Unit price",
        discount_amount: "Discount",
        total: "Total",
      },
    },
    proposal_templates: {
      name: "Proposal template |||| Proposal templates",
      empty_description: "No description",
      status: {
        active: "Active",
        inactive: "Inactive",
      },
      action: {
        new: "New template",
      },
      create: {
        error: "Could not create the proposal template",
      },
      edit: {
        error: "Could not update the proposal template",
      },
      empty: {
        title: "No proposal templates yet",
        description:
          "Create templates to speed up commercial proposal assembly.",
      },
      fields: {
        name: "Name",
        description: "Internal description",
        default_scope: "Default scope",
        default_terms: "Default terms",
        active: "Active",
        items: "Default items",
      },
    },
    proposal_template_items: {
      name: "Default item |||| Default items",
      fields: {
        description: "Description",
        quantity: "Quantity",
        unit_price: "Unit price",
        discount_amount: "Discount",
      },
    },
    sales_goals: {
      name: "Sales goal |||| Sales goals",
      action: {
        new: "New goal",
      },
      fields: {
        sales_id: "Seller",
        period_start: "Month",
        revenue_goal: "Revenue goal",
        won_deals_goal: "Won deals goal",
        sent_proposals_goal: "Sent proposals goal",
      },
      help: {
        period_start: "Choose the first day of the goal month.",
      },
      validation: {
        period_start_first_day: "The month must start on the first day.",
      },
      unknown_seller: "Unknown seller",
    },
    automation_rules: {
      name: "Automation |||| Automations",
      fields: {
        enabled: "Active",
        name: "Name",
        description: "Description",
        params: "Parameters",
      },
    },
    automation_runs: {
      name: "Run |||| Runs",
    },
    notes: {
      name: "Note |||| Notes",
      forcedCaseName: "Note",
      fields: {
        status: "Status",
        date: "Date",
        attachments: "Attachments",
        contact_id: "Contact",
        deal_id: "Deal",
      },
      action: {
        add: "Add note",
        add_first: "Add your first note",
        delete: "Delete note",
        edit: "Edit note",
        update: "Update note",
        add_this: "Add this note",
      },
      sheet: {
        create: "Create note",
        create_for: "Create note for %{name}",
        edit: "Edit note",
        edit_for: "Edit note for %{name}",
      },
      deleted: "Note deleted",
      empty: "No notes yet",
      author_added: "%{name} added a note",
      you_added: "You added a note",
      me: "Me",
      list: {
        error_loading: "Error loading notes",
      },
      note_for_contact: "Note for %{name}",
      stepper: {
        hint: "Go to a contact page and add a note",
      },
      added: "Note added",
      inputs: {
        add_note: "Add a note",
        options_hint: "(attach files, or change details)",
        show_options: "Show options",
      },
      actions: {
        attach_document: "Attach document",
      },
      validation: {
        note_or_attachment_required: "A note or an attachment is required",
      },
    },
    sales: {
      name: "Team member |||| Team",
      fields: {
        first_name: "First name",
        last_name: "Last name",
        email: "Email",
        administrator: "Admin",
        disabled: "Disabled",
      },
      status: {
        active: "Active",
        invited: "Invited",
      },
      create: {
        error: "An error occurred while inviting the team member.",
        success:
          "Invitation created. They can now sign in with this email through Prymeira Auth.",
        title: "Invite team member",
      },
      edit: {
        error: "An error occurred. Please try again.",
        record_not_found: "Record not found",
        success: "Team member updated successfully",
        title: "Edit %{name}",
      },
      action: {
        new: "Invite member",
      },
    },
    tasks: {
      name: "Task |||| Tasks",
      forcedCaseName: "Task",
      fields: {
        text: "Description",
        due_date: "Due date",
        type: "Type",
        contact_id: "Contact",
        lead_id: "Lead",
        deal_id: "Deal",
        due_short: "due",
      },
      action: {
        add: "Add task",
        create: "Create task",
        edit: "Edit task",
      },
      actions: {
        postpone_next_week: "Postpone to next week",
        postpone_tomorrow: "Postpone to tomorrow",
        title: "task actions",
      },
      added: "Task added",
      deleted: "Task deleted successfully",
      dialog: {
        create: "Create task",
        create_for: "Create task for %{name}",
      },
      sheet: {
        edit: "Edit task",
        edit_for: "Edit task for %{name}",
      },
      empty: "No tasks yet",
      empty_list_hint: "Tasks added to your contacts will appear here.",
      filters: {
        later: "Later",
        overdue: "Overdue",
        this_week: "This week",
        today: "Today",
        tomorrow: "Tomorrow",
        with_pending: "With pending tasks",
      },
      regarding_contact: "(Re: %{name})",
      regarding_lead: "(Lead: %{name})",
      regarding_deal: "(Deal: %{name})",
      updated: "Task updated",
    },
    stage_task_templates: {
      name: "Stage playbook |||| Stage playbooks",
      fields: {
        due_in_days: "Due in days",
        enabled: "Active",
        instructions: "Instructions",
        mode: "Mode",
        name: "Name",
        stage: "Stage",
        task_text: "Task text",
        task_type: "Task type",
      },
      modes: {
        automatic: "Automatic",
        manual: "Quick task",
      },
      create_task_error: "Could not create the suggested task",
      created_task: "Suggested task created",
      existing_task_title: "An open task already exists for this suggestion",
      stage_in_use:
        "This stage has linked playbooks. Remove or move the playbooks before deleting the stage.",
      settings: {
        count: "%{smart_count} rule |||| %{smart_count} rules",
        create: "Create rule",
        create_error: "Could not create the playbook rule",
        created: "Playbook rule created",
        delete_error: "Could not delete the playbook rule",
        deleted: "Playbook rule deleted",
        description:
          "Create fast task suggestions or automatic tasks for each pipeline stage.",
        due_badge: "%{smart_count} day |||| %{smart_count} days",
        edit: "Edit rule",
        empty: "No rules configured for this stage.",
        invalid_due_in_days:
          "Use a whole number of days greater than or equal to zero.",
        new: "New rule",
        save: "Save rule",
        select_pipeline: "Select pipeline",
        select_stage: "Select stage",
        templates: "Rules",
        update_error: "Could not update the playbook rule",
        updated: "Playbook rule updated",
      },
      suggested_next_actions: "Suggested next actions",
      suggestions_count:
        "%{smart_count} suggestion |||| %{smart_count} suggestions",
      update_next_action_error:
        "Suggested task created, but the deal next action was not updated",
    },
    tags: {
      name: "Tag |||| Tags",
      action: {
        add: "Add tag",
        create: "Create new tag",
      },
      dialog: {
        color: "Color",
        create_title: "Create a new tag",
        edit_title: "Edit tag",
        name_label: "Tag name",
        name_placeholder: "Enter tag name",
      },
    },
  },
  crm: {
    action: {
      reset_password: "Reset Password",
    },
    auth: {
      first_name: "First name",
      last_name: "Last name",
      confirm_password: "Confirm password",
      confirmation_required:
        "Please follow the link we just sent you by email to confirm your account.",
      recovery_email_sent:
        "If you're a registered user, you should receive a password recovery email shortly.",
      sign_in_failed: "Failed to log in.",
      sign_in_google_workspace: "Sign in with Google Workplace",
      signup: {
        create_account: "Create account",
        create_first_user:
          "Create the first user account to complete the setup.",
        creating: "Creating...",
        initial_user_created: "Initial user successfully created",
      },
      welcome_title: "Welcome to Atomic CRM",
    },
    common: {
      activity: "Activity",
      added: "added",
      details: "Details",
      last_activity_with_date: "last activity %{date}",
      load_more: "Load more",
      misc: "Misc",
      past: "Past",
      read_more: "Read more",
      retry: "Retry",
      show_less: "Show less",
      copied: "Copied!",
      copy: "Copy",
      loading: "Loading...",
      me: "Me",
      task_count: "%{smart_count} task |||| %{smart_count} tasks",
    },
    changelog: {
      title: "Changelog",
    },
    activity: {
      added_company: "%{name} added company",
      you_added_company: "You added company",
      added_contact: "%{name} added",
      you_added_contact: "You added",
      added_note: "%{name} added a note about",
      you_added_note: "You added a note about",
      added_note_about_deal: "%{name} added a note about deal",
      you_added_note_about_deal: "You added a note about deal",
      added_deal: "%{name} added deal",
      you_added_deal: "You added deal",
      at_company: "at",
      to: "to",
      load_more: "Load more activity",
    },
    dashboard: {
      deals_chart: "Upcoming Deal Revenue",
      deals_pipeline: "Deals Pipeline",
      latest_activity: "Latest Activity",
      latest_activity_error: "Error loading latest activity",
      latest_notes: "My Latest Notes",
      latest_notes_added_ago: "added %{timeAgo}",
      seller_cockpit: {
        title: "Today in Sales",
        due_today: "Tasks due today",
        pending_leads: "Pending leads",
        hot_leads: "Hot leads",
        leads_no_next_action: "Leads without next action",
        no_next_action: "Deals without next action",
        stale_deals: "Stale deals",
      },
      sales_summary: {
        title: "Sales Summary",
        open_deals: "Open deals",
        open_amount: "Open value",
        weighted_amount: "Weighted value",
        won_amount: "Won value",
        sales_ranking: "Sales ranking",
      },
      leads: {
        title: "Lead funnel",
        open: "Open leads",
        hot: "Hot leads",
        missing_next_action: "No next action",
        conversion_rate: "Conversion",
      },
      proposals: {
        title: "Proposals",
        open_count: "Open proposals",
        open_amount: "Open value",
        accepted_count: "Accepted proposals",
        acceptance_rate: "Acceptance rate",
        expired_count: "Expired proposals",
        expired_amount: "Expired value",
      },
      deal_risk: {
        title: "Pipeline risks",
        items_at_risk: "Items in risk agenda",
        by_stage: "By stage",
        lost_reasons: "Lost reasons",
        no_lost_reasons: "No lost reasons recorded",
      },
      advanced: {
        revenue_forecast: {
          title: "Revenue forecast",
          weighted_deals: "Weighted deals",
          open_proposals: "Open proposals",
          total: "Total forecast",
        },
        goal_progress: {
          title: "Goal progress",
          revenue: "Revenue",
          won_deals: "Won deals",
          sent_proposals: "Sent proposals",
          empty: "No sales goals to display.",
        },
        funnel_conversion: {
          title: "Funnel conversion",
          leads: "Leads",
          converted_leads: "Converted leads",
          deals_with_proposal: "Deals with proposal",
          accepted_proposals: "Accepted proposals",
          won_deals: "Won deals",
        },
        pipeline_aging: {
          title: "Pipeline aging",
          open_deal_age: "Average open deal age",
          stale_deals: "Stale deals",
          sent_proposal_age: "Average sent proposal age",
        },
        seller_ranking: {
          title: "Sales ranking",
          won_amount: "Won",
          weighted_amount: "Weighted",
          accepted_proposals: "Accepted",
          overdue_tasks: "Overdue tasks",
          empty: "No sellers to display.",
        },
        loss_reasons: {
          title: "Loss reasons",
          empty: "No loss reasons recorded.",
        },
      },
      stepper: {
        install: "Install Atomic CRM",
        progress: "%{step}/3 done",
        whats_next: "What's next?",
      },
      upcoming_tasks: "Upcoming Tasks",
    },
    header: {
      import_data: "Import data",
    },
    image_editor: {
      change: "Change",
      drop_hint: "Drop a file to upload, or click to select it.",
      editable_content: "Editable content",
      title: "Upload and resize image",
      update_image: "Update Image",
    },
    import: {
      action: {
        download_error_report: "Download the error report",
        import: "Import",
        import_another: "Import another file",
      },
      error: {
        unable: "Unable to import this file.",
      },
      idle: {
        description_1:
          "You can import sales, companies, contacts, notes, and tasks.",
        description_2:
          "Data must be in a JSON file matching the following sample:",
      },
      status: {
        all_success: "All records were imported successfully.",
        complete: "Import complete.",
        failed: "Failed",
        imported: "Imported",
        in_progress:
          "Import in progress, please don't navigate away from this page.",
        some_failed: "Some records were not imported.",
        table_caption: "Import status",
      },
      title: "Import Data",
    },
    settings: {
      about: "About",
      automations: "Automations",
      stage_task_templates: "Playbooks",
      companies: {
        sectors: "Sectors",
      },
      dark_mode_logo: "Dark Mode Logo",
      deals: {
        categories: "Categories",
        currency: "Currency",
        lost_reasons: "Lost Reasons",
        pipeline_help:
          "Select which deal stages should count as pipeline deals.",
        pipeline_statuses: "Pipeline Statuses",
        stages: "Stages",
        types: "Deal Types",
      },
      light_mode_logo: "Light Mode Logo",
      notes: {
        statuses: "Statuses",
      },
      reset_defaults: "Reset to Defaults",
      save_error: "Failed to save configuration",
      saved: "Configuration saved successfully",
      saving: "Saving...",
      tasks: {
        types: "Types",
      },
      preferences: "Preferences",
      title: "Settings",
      app_title: "App Title",
      sections: {
        branding: "Branding",
      },
      validation: {
        duplicate: "Duplicate %{display_name}: %{items}",
        in_use:
          "Cannot remove %{display_name} that are still used by deals: %{items}",
        validating: "Validating\u2026",
        entities: {
          categories: "categories",
          deal_types: "deal types",
          lost_reasons: "lost reasons",
          stages: "stages",
        },
      },
    },
    theme: {
      dark: "Dark",
      label: "Theme",
      light: "Light",
      system: "System",
    },
    language: "Language",
    navigation: {
      label: "CRM navigation",
    },
    profile: {
      inbound: {
        description:
          "You can start sending emails to your server's inbound email address, e.g. by adding it to the %{field} field. Atomic CRM will process the emails and add notes to the corresponding contacts.",
        title: "Inbound email",
      },
      mcp: {
        title: "MCP Server",
        description:
          "Use this URL to connect your AI assistant to your CRM data via the Model Context Protocol (MCP).",
      },
      password: {
        change: "Change password",
      },
      password_reset_sent:
        "A reset password email has been sent to your email address",
      record_not_found: "Record not found",
      title: "Profile",
      updated: "Your profile has been updated",
      update_error: "An error occurred. Please try again",
    },
    validation: {
      invalid_url: "Must be a valid URL",
      invalid_linkedin_url: "URL must be from linkedin.com",
    },
  },
} as const;

type MessageSchema<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
      ? MessageSchema<T[K]>
      : never;
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : T[K];
};

export type CrmMessages = MessageSchema<typeof englishCrmMessages>;
export type PartialCrmMessages = DeepPartial<CrmMessages>;
