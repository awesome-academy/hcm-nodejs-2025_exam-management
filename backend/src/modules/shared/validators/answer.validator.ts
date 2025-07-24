import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

export const validateMultipleChoiceAnswers = async (
  i18n: I18nService,
  answers: any[],
) => {
  const normalized = answers.map((a) => ({
    ...a,
    is_active: a.is_active ?? true,
  }));

  const activeAnswers = normalized.filter((a) => a.is_active);
  const correctAnswers = activeAnswers.filter((a) => a.is_correct);
  const invalidCorrectAnswers = normalized.filter(
    (a) => a.is_correct && !a.is_active,
  );
  if (invalidCorrectAnswers.length > 0) {
    throw new BadRequestException(
      await i18n.t('question.correct_answer_must_be_active'),
    );
  }

  if (activeAnswers.length < 2) {
    throw new BadRequestException(
      await i18n.t('question.multiple_choice_min_2_active'),
    );
  }

  if (activeAnswers.length > 4) {
    throw new BadRequestException(
      await i18n.t('question.multiple_choice_max_4_active'),
    );
  }

  if (correctAnswers.length !== 1) {
    throw new BadRequestException(
      await i18n.t('question.multiple_choice_only_1_correct'),
    );
  }
};

export const validateEssayAnswers = async (
  i18n: I18nService,
  answers: any[],
) => {
  const normalized = answers.map((a) => ({
    ...a,
    is_active: a.is_active ?? true,
  }));

  const activeAnswers = normalized.filter((a) => a.is_active);
  const activeCorrectAnswers = normalized.filter(
    (a) => a.is_active && a.is_correct,
  );
  const correctAnswers = normalized.filter((a) => a.is_correct);

   if (activeAnswers.length > 1) {
    throw new BadRequestException(
      await i18n.t('question.essay_only_1_active'),
    );
  }

  if (activeCorrectAnswers.length > 1) {
    throw new BadRequestException(
      await i18n.t('question.essay_only_1_active_correct'),
    );
  }

  if (activeCorrectAnswers.length === 1) {
    const correctAnswer = activeCorrectAnswers[0];
    if (!correctAnswer.answer_text || correctAnswer.answer_text.trim() === '') {
      throw new BadRequestException(
        await i18n.t('question.essay_answer_must_not_be_empty'),
      );
    }
  }
  
  if (correctAnswers.length > 1) {
    throw new BadRequestException(
      await i18n.t('question.essay_only_1_correct'),
    );
  }
};
