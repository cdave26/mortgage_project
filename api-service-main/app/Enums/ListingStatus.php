<?php

namespace App\Enums;

enum ListingStatus: string
{
    case PUBLISHED = 'published';
    case SALE_PENDING = 'sale_pending';
    case LISTING_SOLD = 'listing_sold';
    case LISTING_CANCELLED = 'listing_cancelled';
    case DRAFT = 'draft';
    case PENDING_REVIEW = 'pending_review';
    case ARCHIVED = 'archived';
    case LISTING_REMOVED = 'listing_removed';
    case AGENT_DRAFT= 'agent_draft';

    public function description(): string
    {
        return match ($this)
        {
            self::PUBLISHED => 'Active/Published',
            self::SALE_PENDING => 'Sale Pending',
            self::LISTING_SOLD => 'Listing Sold',
            self::LISTING_CANCELLED => 'Listing Cancelled',
            self::DRAFT => 'Draft',
            self::PENDING_REVIEW => 'Flyer Pending Review',
            self::ARCHIVED => 'Archived',
            self::LISTING_REMOVED => 'Listing Removed',
            self::AGENT_DRAFT => 'Agent Draft'
        };
    }
}
