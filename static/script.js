// script.js
$(document).ready(function() {

    // Search publishers form submission
    $('#search-form').submit(function(e) {
        e.preventDefault();
        const searchTerm = $('#search-input').val().trim();
        
        if (searchTerm) {
            $.post('/search_publishers', { search_term: searchTerm }, function(data) {
                displayPublishers(data);
            });
        }
    });


    
    
    // Publisher click event to show widgets
    $(document).on('click', '.view-widgets-btn', function() {
        const publisherId = $(this).data('id');
        const publisherName = $(this).data('name');
        
        // Set selected publisher name
        $('#selected-publisher').text(publisherName);
        
        // Get widgets for this publisher
        $.get(`/get_widgets/${publisherId}`, function(data) {
            displayWidgets(data);
        });
    });
    
    
    // Display publishers in the list
    function displayPublishers(publishers) {
        const publishersList = $('#publishers-list');
        publishersList.empty();
        
        if (publishers.length === 0) {
            publishersList.html('<p class="no-results">No publishers found matching your search.</p>');
            return;
        }
        
        publishers.forEach(publisher => {
            const item = $('<div class="list-item publisher-item"></div>');
            
            // Main info
            let content = `
                <h3>${publisher.name} (ID: ${publisher.id})</h3>
                <p><strong>Type:</strong> ${publisher.publisher_rumble_content_type || 'N/A'}</p>
                <p><strong>Domain:</strong> ${publisher.domain_type || 'N/A'}</p>
                <p><strong>Status:</strong> ${publisher.status}</p>
                <button class="toggle-details">Show/Hide Details</button>
                <div class="publisher-details" STYLE="display:none">
                    <h4>Additional Details</h4>
                    <table class="details-table">
                        <tr><th>Created On</th><td>${formatDate(publisher.created_on)}</td></tr>
                        <tr><th>Updated On</th><td>${formatDate(publisher.updated_on)}</td></tr>
                        <tr><th>Subdomain</th><td>${publisher.subdomain || 'N/A'}</td></tr>
                        <tr><th>Time Zone</th><td>${publisher.time_zone || 'N/A'}</td></tr>
                        <tr><th>PWA Enabled</th><td>${publisher.is_pwa_enabled ? 'Yes' : 'No'}</td></tr>
                        <tr><th>Is Distributor</th><td>${publisher.is_distributor ? 'Yes' : 'No'}</td></tr>
                        <tr><th>Ad Free</th><td>${publisher.is_ad_free ? 'Yes' : 'No'}</td></tr>
                        <tr><th>Pro User</th><td>${publisher.is_pro_user ? 'Yes' : 'No'}</td></tr>
                        <tr><th>RTL Layout</th><td>${publisher.is_rtl_layout ? 'Yes' : 'No'}</td></tr>
                        <tr><th>GA ID</th><td>${publisher.ga_id || 'N/A'}</td></tr>
                        <tr><th>Content Platform URL</th><td>${publisher.content_platform_url || 'N/A'}</td></tr>
                        <tr><th>Operator Redirection URL</th><td>${publisher.operator_redirection_url || 'N/A'}</td></tr>
                        <tr><th>Unsubscription URL</th><td>${publisher.unsubscription_url || 'N/A'}</td></tr>
                        <tr><th>Show on Dashboard</th><td>${publisher.show_on_dashboard ? 'Yes' : 'No'}</td></tr>
                        <tr><th>ID MD5</th><td>${publisher.id_md5 || 'N/A'}</td></tr>
                    </table>
                `;
            
            // Handle JSON metadata if it exists
            if (publisher.metadata) {
                let metadata;
                try {
                    metadata = typeof publisher.metadata === 'string' ? JSON.parse(publisher.metadata) : publisher.metadata;
                    content += `
                        <h4>Metadata</h4>
                        <pre class="json-data">${JSON.stringify(metadata, null, 2)}</pre>
                    `;
                } catch(e) {
                    content += `
                        <h4>Metadata (Raw)</h4>
                        <div class="raw-data">${publisher.metadata}</div>
                    `;
                }
            }
            
            // Handle JSON unsubscription_metadata if it exists
            if (publisher.unsubscription_metadata) {
                let metadata;
                try {
                    metadata = typeof publisher.unsubscription_metadata === 'string' ? 
                        JSON.parse(publisher.unsubscription_metadata) : publisher.unsubscription_metadata;
                    content += `
                        <h4>Unsubscription Metadata</h4>
                        <pre class="json-data">${JSON.stringify(metadata, null, 2)}</pre>
                    `;
                } catch(e) {
                    content += `
                        <h4>Unsubscription Metadata (Raw)</h4>
                        <div class="raw-data">${publisher.unsubscription_metadata}</div>
                    `;
                }
            }
            
            // Handle JSON lang_layout_metadata if it exists
            if (publisher.lang_layout_metadata) {
                let metadata;
                try {
                    metadata = typeof publisher.lang_layout_metadata === 'string' ? 
                        JSON.parse(publisher.lang_layout_metadata) : publisher.lang_layout_metadata;
                    content += `
                        <h4>Language Layout Metadata</h4>
                        <pre class="json-data">${JSON.stringify(metadata, null, 2)}</pre>
                    `;
                } catch(e) {
                    content += `
                        <h4>Language Layout Metadata (Raw)</h4>
                        <div class="raw-data">${publisher.lang_layout_metadata}</div>
                    `;
                }
            }
            
            content += `</div>`;
            content += `<button class="view-widgets-btn" data-id="${publisher.id}" data-name="${publisher.name}">View Widgets</button>`;
            
            item.html(content);
            publishersList.append(item);
        });
        
        // Show publishers section
        $('#publishers-results').show();
        $('#widgets-results').hide();
        $('#elements-results').hide();
    }
    
    // Display widgets in the list
    function displayWidgets(widgets) {
        const widgetsList = $('#widgets-list');
        widgetsList.empty();
        
        if (widgets.length === 0) {
            widgetsList.html('<p class="no-results">No widgets found for this publisher.</p>');
            return;
        }
        
        widgets.forEach(widget => {
            const item = $('<div class="list-item widget-item"></div>');
            
            // Main info
            let content = `
                <h3>${widget.title || 'Untitled'} (ID: ${widget.id})</h3>
                <p><strong>Type:</strong> ${widget.type || 'N/A'}</p>
                <p><strong>Content Type:</strong> ${widget.content_type || 'N/A'}</p>
                <p><strong>Priority:</strong> ${widget.priority || 'N/A'}</p>
                <p><strong>Status:</strong> ${widget.status}</p>
                <p><strong>Platform:</strong> ${widget.platform || 'N/A'}</p>
                <button class="toggle-details">Show/Hide Details</button>
                <div class="widget-details" style="display:none">
                    <h4>Additional Details</h4>
                    <table class="details-table">
                        <tr><th>Created On</th><td>${formatDate(widget.created_on)}</td></tr>
                        <tr><th>Updated On</th><td>${formatDate(widget.updated_on)}</td></tr>
                        <tr><th>Map Type</th><td>${widget.map_type || 'N/A'}</td></tr>
                        <tr><th>Map Status</th><td>${widget.map_status || 'N/A'}</td></tr>
                        <tr><th>Country</th><td>${widget.country || 'N/A'}</td></tr>
                        <tr><th>Slug</th><td>${widget.slug || 'N/A'}</td></tr>
                    </table>
            `;
            
            // Add descriptions in different languages if available
            if (widget.desc) content += `<p><strong>Description:</strong> ${widget.desc}</p>`;
            if (widget.desc_ar) content += `<p><strong>Description (Arabic):</strong> ${widget.desc_ar}</p>`;
            if (widget.desc_pl) content += `<p><strong>Description (Polish):</strong> ${widget.desc_pl}</p>`;
            if (widget.desc_el) content += `<p><strong>Description (Greek):</strong> ${widget.desc_el}</p>`;
            if (widget.desc_fr) content += `<p><strong>Description (French):</strong> ${widget.desc_fr}</p>`;
            
            // Add titles in different languages if available
            if (widget.title_ar) content += `<p><strong>Title (Arabic):</strong> ${widget.title_ar}</p>`;
            if (widget.title_pl) content += `<p><strong>Title (Polish):</strong> ${widget.title_pl}</p>`;
            if (widget.title_el) content += `<p><strong>Title (Greek):</strong> ${widget.title_el}</p>`;
            if (widget.title_fr) content += `<p><strong>Title (French):</strong> ${widget.title_fr}</p>`;
            
            // Handle icons if available
            if (widget.icon_url) {
                content += `
                    <div class="icon-container">
                        <p><strong>Icon:</strong></p>
                        <img src="${widget.icon_url}" alt="Widget Icon" class="widget-icon">
                    </div>
                `;
            }
            
            if (widget.light_theme_icon_url) {
                content += `
                    <div class="icon-container">
                        <p><strong>Light Theme Icon:</strong></p>
                        <img src="${widget.light_theme_icon_url}" alt="Widget Light Theme Icon" class="widget-icon">
                    </div>
                `;
            }
            
            // Handle JSON metadata if it exists
            if (widget.metadata) {
                let metadata;
                try {
                    metadata = typeof widget.metadata === 'string' ? JSON.parse(widget.metadata) : widget.metadata;
                    content += `
                        <h4>Metadata</h4>
                        <pre class="json-data">${JSON.stringify(metadata, null, 2)}</pre>
                    `;
                } catch(e) {
                    content += `
                        <h4>Metadata (Raw)</h4>
                        <div class="raw-data">${widget.metadata}</div>
                    `;
                }
            }
            
            content += `</div>`;
            content += `<button class="view-elements-btn" data-id="${widget.id}" data-title="${widget.title || 'Untitled'}">View Elements</button>`;
            
            item.html(content);
            widgetsList.append(item);
        });
        
        // Show widgets section
        $('#publishers-results').hide();
        $('#widgets-results').show();
        $('#elements-results').hide();
    }
    
    // Toggle widget details
    $(document).on('click', '.toggle-details', function() {
        $(this).siblings('.widget-details, .publisher-details, .element-details, .api-details').toggle();
    });
    
    // Widget click event to show elements
    $(document).on('click', '.view-elements-btn', function() {
        const widgetId = $(this).data('id');
        const widgetTitle = $(this).data('title');
        
        // Set selected widget title
        $('#selected-widget').text(widgetTitle);

        //set selected widget id
        $('#selected-widget-id').text(widgetId);
        
        // Get elements and API details for this widget
        $.get(`/get_widget_details/${widgetId}`, function(data) {
            displayApiDetails(data.api_details);
            displayElements(data.elements);
        });
    });
    
    // Display API details
    function displayApiDetails(apiDetails) {
        const apiList = $('#api-list');
        apiList.empty();
        
        if (apiDetails.length === 0) {
            apiList.html('<p class="no-results">No API details found for this widget.</p>');
            return;
        }
        
        apiDetails.forEach(api => {
            const item = $('<div class="list-item api-item"></div>');
            
            // Main API info
            let content = `
                <h4>API ID: ${api.id}</h4>
                <p><strong>Status:</strong> ${api.status}</p>
                <p><strong>Data API:</strong> ${api.data_api || 'N/A'}</p>
                <p><strong>Filter API:</strong> ${api.filter_api || 'N/A'}</p>
                <button class="toggle-details">Show/Hide Details</button>
                <div class="api-details" style="display:none">
                    <h5>Additional Details</h5>
                    <table class="details-table">
                        <tr><th>Created On</th><td>${formatDate(api.created_on)}</td></tr>
                        <tr><th>Updated On</th><td>${formatDate(api.updated_on)}</td></tr>
                    </table>
            `;
            
            // Handle JSON data_api_params
            if (api.data_api_params) {
                let apiParams;
                if (typeof api.data_api_params === 'object') {
                    apiParams = JSON.stringify(api.data_api_params, null, 2);
                } else {
                    try {
                        apiParams = JSON.stringify(JSON.parse(api.data_api_params), null, 2);
                    } catch(e) {
                        apiParams = api.data_api_params;
                    }
                }
                
                content += `
                    <div class="api-params">
                        <h5>Data API Params</h5>
                        <pre class="json-data">${apiParams}</pre>
                    </div>
                `;
            }
            
            // Handle other JSON metadata if it exists
            if (api.metadata) {
                let metadata;
                try {
                    metadata = typeof api.metadata === 'string' ? JSON.parse(api.metadata) : api.metadata;
                    content += `
                        <h5>Metadata</h5>
                        <pre class="json-data">${JSON.stringify(metadata, null, 2)}</pre>
                    `;
                } catch(e) {
                    content += `
                        <h5>Metadata (Raw)</h5>
                        <div class="raw-data">${api.metadata}</div>
                    `;
                }
            }
            
            content += `</div>`;
            
            item.html(content);
            apiList.append(item);
        });
    }
    
    // Display elements
    function displayElements(elements) {
        const elementsList = $('#elements-list');
        elementsList.empty();
        
        if (elements.length === 0) {
            elementsList.html('<p class="no-results">No elements found for this widget.</p>');
            return;
        }
        
        elements.forEach(element => {
            const item = $('<div class="list-item element-item"></div>');
            
            if (element.is_carousel) {
                // This is a carousel element from widget_carousel table
                let content = `
                    <h4>Carousel (ID: ${element.id})</h4>
                    <p><strong>Title:</strong> ${element.name || 'Untitled'}</p>
                    <p><strong>Status:</strong> ${element.status}</p>
                    <p><strong>Type:</strong> ${element.type || 'N/A'}</p>
                    <p><strong>Priority:</strong> ${element.priority || 'N/A'}</p>
                    <p><strong>Entity ID (Lobby ID):</strong> ${element.entity_id || 'N/A'}</p>
                    <button class="toggle-details">Show/Hide Details</button>
                    <div class="element-details" style="display:none">
                        <h5>Additional Details</h5>
                        <table class="details-table">
                            <tr><th>Created On</th><td>${formatDate(element.created_on)}</td></tr>
                            <tr><th>Updated On</th><td>${formatDate(element.updated_on)}</td></tr>
                `;
                
                if (element.data_api) {
                    content += `<tr><th>Data API</th><td>${element.data_api}</td></tr>`;
                }
                
                content += `</table>`;
                
                // Handle JSON data_api_params if it exists
                if (element.data_api_params) {
                    let apiParams;
                    try {
                        apiParams = typeof element.data_api_params === 'string' ? 
                            JSON.parse(element.data_api_params) : element.data_api_params;
                        content += `
                            <h5>Data API Params</h5>
                            <pre class="json-data">${JSON.stringify(apiParams, null, 2)}</pre>
                        `;
                    } catch(e) {
                        content += `
                            <h5>Data API Params (Raw)</h5>
                            <div class="raw-data">${element.data_api_params}</div>
                        `;
                    }
                }
                
                if (element.filter_api) {
                    content += `<p><strong>Filter API:</strong> ${element.filter_api}</p>`;
                }
                
                content += `</div>`;
                
                item.html(content);
            } else {
                // Regular element from widgets_element table
                let content = `
                    <h4>${element.name || 'Unnamed Element'} (ID: ${element.id})</h4>
                    <p><strong>Type:</strong> ${getElementTypeName(element.type)}</p>
                    <p><strong>Enitity:</strong> ${element.entity_id || 'N/A'}</p>

                    <p><strong>Status:</strong> ${element.status}</p>
                    <p><strong>Order:</strong> ${element.order || 'N/A'}</p>
                    <button class="toggle-details">Show/Hide Details</button>
                    <div class="element-details" style="display:none">
                        <h5>Additional Details</h5>
                        <table class="details-table">
                            <tr><th>Created On</th><td>${formatDate(element.created_on)}</td></tr>
                            <tr><th>Updated On</th><td>${formatDate(element.updated_on)}</td></tr>
                            <tr><th>Is Featured</th><td>${element.is_featured ? 'Yes' : 'No'}</td></tr>
                            <tr><th>Entity ID</th><td>${element.entity_id || 'N/A'}</td></tr>
                            <tr><th>Widgets ID</th><td>${element.widgets_id || 'N/A'}</td></tr>
                `;
                
                
                
                // Handle entity details if available
                if (element.entity_details) {
                    content += `
                        <h5>Entity Details</h5>
                        <div class="entity-details">
                    `;
                    
                    if (typeof element.entity_details === 'object') {
                        // Display each property
                        for (const key in element.entity_details) {
                            // Skip if null or empty
                            if (element.entity_details[key] === null || element.entity_details[key] === '') continue;
                            
                            // Format based on data type
                            if (typeof element.entity_details[key] === 'object' && element.entity_details[key] !== null) {
                                // Handle objects/arrays (likely JSON)
                                content += `
                                    <p><strong>${formatFieldName(key)}:</strong></p>
                                    <pre class="json-data">${JSON.stringify(element.entity_details[key], null, 2)}</pre>
                                `;
                            } else if (key.includes('url') && typeof element.entity_details[key] === 'string') {
                                // Handle URLs that are likely images
                                if (element.entity_details[key].match(/\.(jpeg|jpg|gif|png)$/)) {
                                    content += `
                                        <p><strong>${formatFieldName(key)}:</strong></p>
                                        <div class="icon-container">
                                            <img src="${element.entity_details[key]}" alt="${key}" class="entity-image">
                                        </div>
                                    `;
                                } else {
                                    content += `<p><strong>${formatFieldName(key)}:</strong> ${element.entity_details[key]}</p>`;
                                }
                            } else if (key.includes('date') || key.includes('_on') || key.includes('time')) {
                                // Handle dates
                                content += `<p><strong>${formatFieldName(key)}:</strong> ${formatDate(element.entity_details[key])}</p>`;
                            } else {
                                // Handle regular values
                                content += `<p><strong>${formatFieldName(key)}:</strong> ${element.entity_details[key]}</p>`;
                            }
                        }
                    } else {
                        content += `<p>${JSON.stringify(element.entity_details)}</p>`;
                    }
                    
                    content += `</div>`;
                }
                
                content += `</div>`;
                
                item.html(content);
            }
            
            elementsList.append(item);
        });
        
        // Show elements section
        $('#publishers-results').hide();
        $('#widgets-results').hide();
        $('#elements-results').show();
    }
    
    // Helper function to get element type name
    function getElementTypeName(type) {
        switch(type) {
            case 1: return 'Tournament';
            case 3: return 'Video';
            case 5: return 'Show';
            default: return `Unknown (${type})`;
        }
    }
    
    // Helper function to format field names
    function formatFieldName(key) {
        // Convert camelCase or snake_case to Title Case with spaces
        return key
            .replace(/_/g, ' ')  // Replace underscores with spaces
            .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
            .replace(/^./, function(str) { return str.toUpperCase(); })  // Capitalize first letter
            .trim();  // Remove leading/trailing spaces
    }
    
    // Helper function to format dates
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;  // Invalid date
            
            return date.toLocaleString();
        } catch(e) {
            return dateString;
        }
    }
    
    // Back button handlers
    $('#back-to-publishers').click(function() {
        $('#publishers-results').show();
        $('#widgets-results').hide();
        $('#elements-results').hide();
    });
    
    $('#back-to-widgets').click(function() {
        $('#publishers-results').hide();
        $('#widgets-results').show();
        $('#elements-results').hide();
    });
});