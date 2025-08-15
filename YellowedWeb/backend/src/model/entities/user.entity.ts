import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({ name: 'user_entity' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @UpdateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @Column({ default: 'location' })
  location: string;

  @Column({ default: 'bio' })
  bio: string;

  @Column({ default: 'facebook' })
  facebook: string;

  @Column({ default: 'instagram' })
  instagram: string;

  @Column({ default: 'linkedin' })
  linkedin: string;
}
