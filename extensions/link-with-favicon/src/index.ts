import InterfaceComponent from './interface.vue'

export default {
    id: 'link-with-favicon',
    name: 'Link with Favicon',
    icon: 'link',
    description: 'A link field with favicon support',
    component: InterfaceComponent,
    types: ['json'],
    group: 'standard',
    options: (context: { collection?: string; [key: string]: any }) => {
        const collectionName = context?.collection;
        console.log('[index.ts] Initializing options. Collection context:', collectionName || 'Not available');

        if (!collectionName) {
            console.warn('[index.ts] Collection name is not available. Providing fallback input for selectedFieldName.');
            return [
                {
                    field: 'selectedFieldName',
                    name: 'Related Field Name',
                    type: 'string',
                    meta: {
                        interface: 'input',
                        options: {
                            placeholder: 'Enter field name (e.g., url_field)',
                        },
                        width: 'full',
                        note: 'Could not determine the current collection to list fields. Manually enter the field name that contains the URL.'
                    }
                }
            ];
        }

        console.log('[index.ts] Setting up selectedFieldName option for collection:', collectionName);
        return [
            {
                field: 'selectedFieldName', // This will be props.selectedFieldName in interface.vue
                name: 'Select URL Field',
                type: 'string', 
                meta: {
                    interface: 'system-display-template', 
                    options: {
                        collectionName: collectionName,
                        // This interface allows selecting a field, and its name will be stored.
                    },
                    width: 'full',
                    note: `Select the field from the "${collectionName}" collection that contains the URL (e.g., 'website_url', 'link'). If you use a template like {{field_name}}, it will store "field_name".`
                },
            },
        ];
    },
}