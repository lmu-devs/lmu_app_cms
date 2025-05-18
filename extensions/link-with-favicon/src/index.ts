import InterfaceComponent from "./interface.vue";

export default {
  id: "favicon-extension",
  name: "Favicon Link",
  icon: "link",
  description:
    "A Favicon Link field that generates a favicon from a related field containing a URL.",
  component: InterfaceComponent,
  types: ["string"],
  group: "standard",
  /**
   * A function that defines the configuration options available for this interface.
   * These options are presented to the user when they add or configure this interface on a field.
   * @param context - An object containing context about where the interface is being used,
   *                  including the current `collection` name.
   * @returns {Array<Object>} An array of field option objects for the Directus settings panel.
   */
  options: (context: { collection?: string; [key: string]: any }) => {
    const collectionName = context?.collection;

    // If the collection context isn't available, provide a simple text input for the field name.
    if (!collectionName) {
      console.warn(
        "[index.ts] Collection name is not available. Providing fallback input for selectedFieldName."
      );
      return [
        {
          field: "selectedFieldName",
          name: "Related Field Name",
          type: "string",
          meta: {
            interface: "input",
            options: {
              placeholder: "Enter field name (e.g., url_field)",
            },
            width: "full",
            note: "Could not determine the current collection. Manually enter the name of the related field containing the URL.",
          },
        },
      ];
    }

    // If collection context is available, use system-display-template to allow field selection.
    console.log(
      "[index.ts] Setting up selectedFieldName option for collection:",
      collectionName
    );
    return [
      {
        field: "selectedFieldName",
        name: "Select Related Field",
        type: "string",
        meta: {
          interface: "system-display-template",
          options: {
            collectionName: collectionName,
          },
          width: "full",
          note: `Select the field from the "${collectionName}" collection you want to generate a favicon for. For example, you could select a field named 'url_field', and its content would be used to generate a favicon.`,
        },
      },
    ];
  },
};
