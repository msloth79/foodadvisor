const addOrCreateStage = (entity, newStage) => {
  if (entity.publicationStages != null) {
    return {
      stages: entity.publicationStages.stages.concat(newStage),
    };
  } else {
    return { stages: [newStage] };
  }
};

module.exports = {
  async beforeUpdate(event) {
    const { params } = event;

    const entity = await strapi.db.query('api::article.article').findOne({
      where: { id: params.where.id },
      populate: { createdBy: true },
    });

    if (!params.populate) {
      return;
    }
    const { publicationState, editors, updatedBy } = params.data;

    let fetchedEditors = [];
    let fetchedUpdatedBy = {};

    if (editors && editors.length > 0) {
      try {
        fetchedEditors = await strapi.db.query('admin::user').findMany({
          where: {
            id: {
              $in: [editors],
            },
          },
          populate: ['email'],
        });
      } catch (error) {
        console.log(error);
      }
    }

    if (updatedBy) {
      try {
        fetchedUpdatedBy = await strapi.db.query('admin::user').findOne({
          where: {
            id: {
              $eq: updatedBy,
            },
          },
          populate: ['email'],
        });
      } catch (error) {}
    }

    let message = '';
    let newPublicationStages = entity.publicationStages;
    const editorsEmail = fetchedEditors.map((editor) => editor.email);

    // Publication state has changed
    if (entity.publicationState != publicationState) {
      // Draft to In review
      if (
        publicationState === 'In review' &&
        entity.publicationState === 'Draft'
      ) {
        if (editorsEmail.length > 0) {
          // try {
          //   fetchedEditors.map(async (editor) => {
          //     await strapi.plugins['email'].services.email.send({
          //       to: editor.email,
          //       from: 'hi@strapidemo.com',
          //       replyTo: fetchedUpdatedBy.email,
          //       subject: `${fetchedUpdatedBy.email} created a new content ready to be review`,
          //       text: `A new entry is ready from ${fetchedUpdatedBy.email} to be reviewed in the administration panel.`,
          //     })
          //   })
          // } catch(err) {
          //   console.log(err);
          // }
          console.log(
            `An email has been sent to ${editorsEmail.join(
              ','
            )} notifying them to review this content`
          );
        }
        message = `${fetchedUpdatedBy.email} marked this content as ready to be reviewed.`;
      }

      // In review to Changes requested
      if (
        publicationState === 'Changes requested' &&
        entity.publicationState === 'In review'
      ) {
        // try {
        //   await strapi.plugins['email'].services.email.send({
        //     to: entity.createdBy.email,
        //     from: 'hi@strapidemo.com',
        //     replyTo: fetchedUpdatedBy.email,
        //     subject: `${fetchedUpdatedBy.email} requested some changes`,
        //     text: `${fetchedUpdatedBy.email} requested some changes for an entry you created in the administration panel.`,
        //   })
        // } catch(err) {
        //   console.log(err);
        // }
        console.log(
          `An email has been sent to ${entity.createdBy.email} to notify that some changes have been requested by ${fetchedUpdatedBy.email}`
        );
        message = `${fetchedUpdatedBy.email} requested some changes.`;
      }

      // Changes requested to In review
      if (
        publicationState === 'In review' &&
        entity.publicationState === 'Changes requested'
      ) {
        if (editorsEmail.length > 0) {
          // try {
          //   fetchedEditors.map((editor) => {
          //     await strapi.plugins['email'].services.email.send({
          //       to: editor.email,
          //       from: 'hi@strapidemo.com',
          //       replyTo: entity.createdBy.email,
          //       subject: `${entity.createdBy.firstname} made the requested changes.`,
          //       text: `${entity.createdBy.firstname} mmade the requested changes concerning an entry in the administration panel.`,
          //     })
          //   })

          console.log(
            `An email has been sent to ${editorsEmail.join(
              ','
            )} to notify that the requested changes have been done by the author: ${
              entity.createdBy.email
            }`
          );
          // } catch(err) {
          //   console.log(err);
          // }
        }
        message = `${fetchedUpdatedBy.email} made the requested changes.`;
      }

      // In review to Publication scheduled
      if (publicationState === 'Publication scheduled') {
        // try {
        //   await strapi.plugins['email'].services.email.send({
        //     to: entity.createdBy.email,
        //     from: 'hi@strapidemo.com',
        //     replyTo: fetchedUpdatedBy.email,
        //     subject: `Your entry is scheduled for publication!`,
        //     text: `Congratulations ${entity.createdBy.firstname}, your content is scheduled for publication!`,
        //   })
        // } catch(err) {
        //   console.log(err);
        // }
        console.log(
          `An email has been sent to ${entity.createdBy.email} to notify that its content is scheduled for publication!`
        );
        message = `${fetchedUpdatedBy.email} scheduled the publication of the entry.`;
      }

      if (publicationState === 'Published') {
        // Automatically publish the entry
        // try {
        //   await strapi.plugins['email'].services.email.send({
        //     to: entity.createdBy.email,
        //     from: 'hi@strapidemo.io',
        //     replyTo: fetchedUpdatedBy.email,
        //     subject: `Your entry has been published!`,
        //     text: `Congratulations ${entity.createdBy.firstname}, your content has been published!`,
        //   })
        // } catch(err) {
        //   console.log(err);
        // }
        console.log(
          `An email has been sent to ${entity.createdBy.email} to notify that its content has been published!`
        );
        message = `${fetchedUpdatedBy.email} published the entry.`;
        params.data.publishedAt = new Date();
      }

      if (
        [
          'In review',
          'Changes requested',
          'Publication scheduled',
          'Published',
        ].includes(publicationState)
      ) {
        const newStage = {
          name: publicationState,
          message: message,
          date: new Date(),
        };

        newPublicationStages = addOrCreateStage(entity, newStage);
      } else if (
        entity.publishedAt === null &&
        params.data.publishedAt &&
        publicationState === undefined
      ) {
        const newStage = {
          name: 'Published',
          message: `${fetchedUpdatedBy.email} published the entry.`,
          date: new Date(),
        };

        params.data.publicationState = 'Published';
        newPublicationStages = addOrCreateStage(entity, newStage);
      }
      params.data.publicationStages = newPublicationStages;
    }
  },
};
