# Alembic migration script template

"""add organization_id to core models

Revision ID: edb729d9455c
Revises: 732c617d2a29
Create Date: 2026-05-28 12:34:40.847774

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'edb729d9455c'
down_revision = '732c617d2a29'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('incidents', sa.Column('organization_id', sa.String(length=36), nullable=True))
    op.create_index(op.f('ix_incidents_organization_id'), 'incidents', ['organization_id'], unique=False)
    op.create_foreign_key(None, 'incidents', 'organizations', ['organization_id'], ['id'])
    op.add_column('reports', sa.Column('organization_id', sa.String(length=36), nullable=True))
    op.create_index(op.f('ix_reports_organization_id'), 'reports', ['organization_id'], unique=False)
    op.create_foreign_key(None, 'reports', 'organizations', ['organization_id'], ['id'])
    op.add_column('trusted_wardens', sa.Column('organization_id', sa.String(length=36), nullable=True))
    op.create_index(op.f('ix_trusted_wardens_organization_id'), 'trusted_wardens', ['organization_id'], unique=False)
    op.create_foreign_key(None, 'trusted_wardens', 'organizations', ['organization_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    op.drop_constraint(None, 'trusted_wardens', type_='foreignkey')
    op.drop_index(op.f('ix_trusted_wardens_organization_id'), table_name='trusted_wardens')
    op.drop_column('trusted_wardens', 'organization_id')
    op.drop_constraint(None, 'reports', type_='foreignkey')
    op.drop_index(op.f('ix_reports_organization_id'), table_name='reports')
    op.drop_column('reports', 'organization_id')
    op.drop_constraint(None, 'incidents', type_='foreignkey')
    op.drop_index(op.f('ix_incidents_organization_id'), table_name='incidents')
    op.drop_column('incidents', 'organization_id')
    # ### end Alembic commands ###
