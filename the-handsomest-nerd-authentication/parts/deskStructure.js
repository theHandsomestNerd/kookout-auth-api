// eslint-disable-next-line import/extensions
// eslint-disable-next-line import/extensions
// eslint-disable-next-line import/extensions
// eslint-disable-next-line import/no-unresolved
import {createSuperPane} from 'sanity-super-pane'
// eslint-disable-next-line import/no-unresolved
import S from '@sanity/desk-tool/structure-builder'
import {ReferencedByView} from 'part:@indent-oss/sanityio-referenced-by'

export default () =>
    S.list()
        .title('Base')
        .items([
            S.listItem()
                .title('User')
                .child(createSuperPane('user', S)),
            S.listItem()
                .title('Position')
                .child(createSuperPane('Position', S)),
            S.listItem()
                .title('Bug Report')
                .child(createSuperPane('BugReport', S)),
            S.listItem()
                .title('Extended Profile')
                .child(createSuperPane('ExtendedProfile', S)),
            S.listItem()
                .title('TimelineEvent')
                .child(createSuperPane('TimelineEvent', S)),
            S.listItem()
                .title('Hashtag')
                .child(createSuperPane('Hashtag', S)),
            S.listItem()
                .title('Hashtag Collection')
                .child(createSuperPane('HashtagCollection', S)),
            S.listItem()
                .title('HashtagRelation')
                .child(createSuperPane('HashtagRelation', S)),
            S.listItem()
                .title('Spread Sheet Member to User Relation')
                .child(createSuperPane('SpreadsheetMemberRelation', S)),
            S.listItem()
                .title('Csv to process')
                .child(createSuperPane('csvToProcess', S)),
            S.listItem()
                .title('Spreadsheet Member')
                .child(createSuperPane('spreadsheetMember', S)),
            S.listItem()
                .title('Like')
                .child(createSuperPane('Like', S)),
            S.listItem()
                .title('PhotoAlbum')
                .child(createSuperPane('PhotoAlbum', S)),
            S.listItem()
                .title('AlbumImage')
                .child(createSuperPane('AlbumImage', S)),
            S.listItem()
                .title('Block')
                .child(createSuperPane('Block', S)),
            S.listItem()
                .title('Follow')
                .child(createSuperPane('Follow', S)),
            S.listItem()
                .title('Post Comment')
                .child(createSuperPane('PostComment', S)),
            S.listItem()
                .title('Comment')
                .child(createSuperPane('Comment', S)),
            S.listItem()
                .title('Comment Thread')
                .child(createSuperPane('CommentThread', S)),
            S.listItem()
                .title('Category')
                .child(createSuperPane('Category', S)),
            S.listItem()
                .title('Post')
                .child(createSuperPane('Post', S)),
            S.listItem()
                .title('Media Tags')
                .child(createSuperPane('media.tag', S))
        ]);
export const getDefaultDocumentNode = () => {
    return S.document().views([
        S.view.form(),
        S.view.component(ReferencedByView).title('Referenced by'),
    ])
}