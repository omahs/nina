use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(
    hub_handle: String,
    slug: String,
    _uri: String,
)]
pub struct PostInitViaHub<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds = [b"nina-hub".as_ref(), hub_handle.as_bytes()],
        bump,
    )]
    pub hub: AccountLoader<'info, Hub>,
    #[account(
        init,
        seeds = [b"nina-post".as_ref(), hub.key().as_ref(), post_slug.as_bytes()],
        bump,
        payer = authority,
    )]
    pub post: Box<Account<'info, Post>>,
    #[account(
        init,
        seeds = [b"nina-hub-post".as_ref(), hub.key().as_ref(), post.key().as_ref()],
        bump,
        payer = authority,
    )]
    pub hub_post: Box<Account<'info, HubPost>>,
    #[account(
        init,
        seeds = [b"nina-hub-content".as_ref(), hub.key().as_ref(), post.key().as_ref()],
        bump,
        payer = authority,
    )]
    pub hub_content: Box<Account<'info, HubContent>>,
    #[account(
        seeds = [b"nina-hub-collaborator".as_ref(), hub.key().as_ref(), authority.key().as_ref()],
        bump,
    )]
    pub hub_collaborator: Box<Account<'info, HubCollaborator>>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler (
    ctx: Context<PostInitViaHub>,
    _hub_handle: String,
    slug: String,
    uri: String,
) -> Result<()> {
    let hub_collaborator = &mut ctx.accounts.hub_collaborator;
    
    if !hub_collaborator.can_add_content {
        return Err(error!(ErrorCode::HubCollaboratorCannotInitPost))
    }

    let post = &mut ctx.accounts.post;
    post.author = ctx.accounts.authority.key();
    post.published_through_hub = ctx.accounts.hub.key();
    post.created_at = Clock::get()?.unix_timestamp;
    post.updated_at = post.created_at;

    let mut slug_array = [0u8; 100];
    slug_array[..post_slug.len()].copy_from_slice(&slug.as_bytes());
	post.slug = slug_array

	let mut uri_array = [0u8; 100];
    uri_array[..uri.len()].copy_from_slice(&uri.as_bytes());
    post.uri = uri_array

    let hub_content = &mut ctx.accounts.hub_content;
    hub_content.added_by = ctx.accounts.authority.key();
    hub_content.hub = ctx.accounts.hub.key();
    hub_content.child = ctx.accounts.hub_post.key();
    hub_content.content_type = HubContentType::Post;
    hub_content.datetime = post.created_at;

    let hub_post = &mut ctx.accounts.hub_post;
	hub_post.hub = ctx.accounts.hub.key();
    hub_post.post = ctx.accounts.post.key();
    hub_post.note_on_hub_content = ctx.accounts.note_on_hub_content.key()?;
    hub_post.version_uri = uri_array;

    emit!(PostInitializedViaHub {
        public_key: hub_post.key(),
        hub: hub.key(),
        uri: uri,
    });
}