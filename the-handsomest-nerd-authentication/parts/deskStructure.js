// eslint-disable-next-line import/extensions
// eslint-disable-next-line import/extensions
// eslint-disable-next-line import/extensions
// eslint-disable-next-line import/no-unresolved
import {createSuperPane} from 'sanity-super-pane'
// eslint-disable-next-line import/no-unresolved
import S from '@sanity/desk-tool/structure-builder'

export default () =>
    S.list()
        .title('Base')
        .items([
            S.listItem()
                .title('User')
                .child(createSuperPane('user', S)),
            S.listItem()
                .title('Extended Profile')
                .child(createSuperPane('ExtendedProfile', S)),
            S.listItem()
                .title('Media Tags')
                .child(createSuperPane('media.tag', S))
        ]);
