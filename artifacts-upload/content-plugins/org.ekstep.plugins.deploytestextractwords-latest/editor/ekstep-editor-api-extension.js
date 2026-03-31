ecEditor.Extension = {
    /**
     * @return {ContentMeta} content meta of content being edited in the editor
     */
    getCurrentContentMeta: function() {
        var contentId = ecEditor.getContext('contentId');
        var contentService = ecEditor.getService(ServiceConstants.CONTENT_SERVICE);
        var currentContentMeta = contentService.getContentMeta(contentId);
        return currentContentMeta;
    }
};
